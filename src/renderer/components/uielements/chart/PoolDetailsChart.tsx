import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid, Spin } from 'antd'
// import { Chart as ChartJS, BarElement, PointElement, Tooltip, LineElement, Legend } from 'chart.js'
import { Chart as ChartJS, registerables } from 'chart.js'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { Line, Bar } from 'react-chartjs-2'
import { useIntl } from 'react-intl'

import { useThemeContext } from '../../../contexts/ThemeContext'
import { Button } from '../button'
import { getChartColors, getChartData, getChartOptions, getDisplayData } from './PoolDetailsChart.helpers'
import * as Styled from './PoolDetailsChart.styles'
import {
  ChartDataType,
  ChartDetails,
  ChartDetailsRD,
  ChartTimeFrame,
  ChartType,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

ChartJS.register(...registerables)

type ChartProps = {
  type: ChartType
  unit: string
  chartDetails: ChartDetails
}

const Chart: React.FC<ChartProps> = (props): JSX.Element => {
  const { type, unit, chartDetails } = props

  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const { themeType$ } = useThemeContext()
  const themeType = useObservableState(themeType$, ThemeType.LIGHT)
  const isLight = themeType === ThemeType.LIGHT
  const theme = isLight ? themes.light : themes.dark
  const colors = useMemo(() => getChartColors(theme, isLight), [theme, isLight])

  const { labels, values }: PoolDetailsChartData = getChartData(chartDetails)
  const data = getDisplayData({ labels, values, colors })
  const options = getChartOptions({ unit, colors, isDesktopView })

  const barRef = useRef<ChartJS<'bar'> | null>(null)
  const lineRef = useRef<ChartJS<'line'> | null>(null)

  const renderGradientStroke = useCallback(
    (ctx: CanvasRenderingContext2D): CanvasGradient => {
      const gradientStroke: CanvasGradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradientStroke.addColorStop(0, colors.gradientStart)
      gradientStroke.addColorStop(1, colors.gradientStop)
      return gradientStroke
    },
    [colors.gradientStart, colors.gradientStop]
  )

  useEffect(() => {
    const chart = barRef.current
    if (!chart || type === 'line') return

    const ctx = chart.ctx
    const gradientStroke: CanvasGradient = renderGradientStroke(ctx)
    const data = chart.data
    chart.data = {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: gradientStroke
      }))
    }
  }, [colors.gradientStart, colors.gradientStop, renderGradientStroke, type])

  useEffect(() => {
    if (type === 'line') {
      const chart = lineRef.current
      if (!chart) return

      const { ctx, data } = chart
      const gradientStroke: CanvasGradient = renderGradientStroke(ctx)

      chart.data = {
        ...data,
        datasets: data.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: gradientStroke
        }))
      }
    }

    if (type === 'bar') {
      const chart = barRef.current
      if (!chart) return

      const { ctx, data } = chart
      const gradientStroke: CanvasGradient = renderGradientStroke(ctx)
      chart.data = {
        ...data,
        datasets: data.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: gradientStroke
        }))
      }
    }
  }, [colors.gradientStart, colors.gradientStop, renderGradientStroke, type])

  const otherPros = { width: 100, height: 100, options }
  if (type === 'bar') {
    return <Bar ref={barRef} data={data} {...otherPros} />
  }

  return <Line ref={lineRef} data={data} {...otherPros} />
}

type Props = {
  chartDetails: ChartDetailsRD
  reloadData: FP.Lazy<void>
  chartType: ChartType
  unit: string
  dataTypes: ChartDataType[]
  selectedDataType: ChartDataType
  setDataType: (dataType: ChartDataType) => void
  selectedTimeFrame: ChartTimeFrame
  setTimeFrame: (timeFrame: ChartTimeFrame) => void
}

export const PoolDetailsChart: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    chartDetails: chartDetailsRD,
    reloadData,
    chartType,
    unit,
    dataTypes,
    selectedDataType,
    selectedTimeFrame,
    setDataType,
    setTimeFrame
  } = props

  const intl = useIntl()

  const renderError = useCallback(
    (error: Error) => (
      <Styled.ErrorView
        style={{ backgroundColor: 'transparent' }}
        title={intl.formatMessage({ id: 'common.error' })}
        subTitle={error?.message ?? error.toString()}
        extra={<Button onClick={reloadData}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
      />
    ),
    [intl, reloadData]
  )

  return (
    <Styled.ChartContainer>
      <Styled.HeaderContainer>
        <Styled.TypeContainer>
          {dataTypes.map((dataType) => (
            <Styled.HeaderToggle
              primary={selectedDataType === dataType}
              key={`headerToggle${dataType}`}
              onClick={() => setDataType(dataType)}>
              {dataType}
            </Styled.HeaderToggle>
          ))}
        </Styled.TypeContainer>
        <Styled.TimeContainer>
          <Styled.HeaderToggle primary={selectedTimeFrame === 'week'} onClick={() => setTimeFrame('week')}>
            {intl.formatMessage({ id: 'common.time.week' })}
          </Styled.HeaderToggle>
          <Styled.HeaderToggle primary={selectedTimeFrame === 'allTime'} onClick={() => setTimeFrame('allTime')}>
            {intl.formatMessage({ id: 'common.time.all' })}
          </Styled.HeaderToggle>
        </Styled.TimeContainer>
      </Styled.HeaderContainer>
      <Styled.ChartWrapper>
        {FP.pipe(
          chartDetailsRD,
          RD.fold(
            () => <></>,
            () => <Spin />,
            (error) => renderError(error),
            (chartDetails) => <Chart chartDetails={chartDetails} type={chartType} unit={unit} />
          )
        )}
      </Styled.ChartWrapper>
    </Styled.ChartContainer>
  )
}
