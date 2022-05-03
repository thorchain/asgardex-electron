import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid, Spin } from 'antd'
// import { Chart as ChartJS, BarElement, PointElement, Tooltip, LineElement, Legend } from 'chart.js'
import { Chart as ChartJS, registerables } from 'chart.js'
import * as FP from 'fp-ts/lib/function'
import { Line, Bar } from 'react-chartjs-2'
import { useIntl } from 'react-intl'

import { useTheme } from '../../../hooks/useTheme'
import { Button } from '../button'
import { getChartColors, getChartData, getChartOptions, getDisplayData } from './PoolDetailsChart.helpers'
import * as Styled from './PoolDetailsChart.styles'
import {
  ChartDataType,
  ChartDetails,
  ChartDetailsRD,
  ChartTimeFrame,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

ChartJS.register(...registerables)

type ChartProps = {
  type: ChartDataType
  unit: string
  chartDetails: ChartDetails
}

const Chart: React.FC<ChartProps> = (props): JSX.Element => {
  const { type, unit, chartDetails } = props

  const isDesktopView = Grid.useBreakpoint()?.md ?? false
  const { theme } = useTheme()
  const colors = useMemo(() => getChartColors(theme), [theme])

  const { labels, values }: PoolDetailsChartData = getChartData(chartDetails)
  const data = getDisplayData({ labels, values, colors })
  const options = getChartOptions({ unit, colors, isDesktopView })
  const [chartData, setChartData] = useState(data)

  const barRef = useRef<ChartJS<'bar'> | null>(null)
  const lineRef = useRef<ChartJS<'line'> | null>(null)

  useEffect(() => {
    const renderGradientStroke = (ctx: CanvasRenderingContext2D): CanvasGradient => {
      const gradientStroke: CanvasGradient = ctx.createLinearGradient(0, 100, 0, 300)
      gradientStroke.addColorStop(0, colors.gradientStart)
      gradientStroke.addColorStop(1, colors.gradientStop)
      return gradientStroke
    }

    const chartRef = type === 'liquidity' ? barRef.current : lineRef.current

    if (!chartRef) return

    const { ctx } = chartRef
    const gradientStroke: CanvasGradient = renderGradientStroke(ctx)

    // update background to have a gradient color
    // @see https://react-chartjs-2.js.org/examples/gradient-chart
    // or @see Example for chartjs (w/o React) https://blog.vanila.io/chart-js-tutorial-how-to-make-gradient-line-chart-af145e5c92f9
    setChartData((current) => ({
      ...current,
      datasets: current.datasets.map((dataset) => ({
        ...dataset,
        backgroundColor: gradientStroke
      }))
    }))
  }, [colors.gradientStart, colors.gradientStop, type])

  const renderChart = useMemo(() => {
    const otherPros = { width: 100, height: 100, options }

    if (type === 'liquidity') {
      lineRef.current = null
      return <Bar ref={barRef} data={chartData} {...otherPros} />
    }
    barRef.current = null
    return <Line ref={lineRef} data={chartData} {...otherPros} />
  }, [chartData, options, type])

  return renderChart
}

type Props = {
  chartDetails: ChartDetailsRD
  reloadData: FP.Lazy<void>
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
            (chartDetails) => <Chart chartDetails={chartDetails} type={selectedDataType} unit={unit} />
          )
        )}
      </Styled.ChartWrapper>
    </Styled.ChartContainer>
  )
}
