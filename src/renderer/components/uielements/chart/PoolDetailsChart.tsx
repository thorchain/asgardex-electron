import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid, Spin } from 'antd'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  Tooltip,
  LineElement,
  Legend
} from 'chart.js'
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
  ChartDetailsRD,
  ChartTimeFrame,
  ChartType,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

ChartJS.register(CategoryScale, LinearScale, LineElement, BarElement, PointElement, Title, Tooltip, Legend)

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

  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const intl = useIntl()

  const { themeType$ } = useThemeContext()
  const themeType = useObservableState(themeType$, ThemeType.LIGHT)
  const isLight = themeType === ThemeType.LIGHT
  const theme = isLight ? themes.light : themes.dark
  const colors = useMemo(() => getChartColors(theme, isLight), [theme, isLight])

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

  const Chart = chartType === 'bar' ? Bar : Line

  return (
    <Styled.ChartContainer gradientStart={colors.backgroundGradientStart} gradientStop={colors.backgroundGradientStop}>
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
            (chartDetails) => {
              const { labels: l, values }: PoolDetailsChartData = getChartData(chartDetails)
              const data = getDisplayData({ labels: l, values, colors })
              const _options = getChartOptions({ unit, colors, isDesktopView })

              return (
                <Chart
                  data={data}
                  width={100}
                  height={100}
                  // options={{ ...options, maintainAspectRatio: false }}
                  options={{ maintainAspectRatio: false }}
                />
              )
            }
          )
        )}
      </Styled.ChartWrapper>
    </Styled.ChartContainer>
  )
}
