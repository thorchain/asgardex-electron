import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid, Spin } from 'antd'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { useThemeContext } from '../../../contexts/ThemeContext'
import { ErrorView } from '../../shared/error'
import { getChartColors, getChartData, getChartOptions, getDisplayData } from './PoolDetailsChart.helpers'
import {
  ChartContainer,
  HeaderContainer,
  TypeContainer,
  TimeContainer,
  HeaderToggle,
  ChartWrapper,
  BarChart,
  LineChart
} from './PoolDetailsChart.styles'
import { ChartDetails, ChartDetailsRD, ChartTimeFrame, ChartType, PoolDetailsChartData } from './types'

type Props = {
  chartDetails: ChartDetailsRD
  chartType: ChartType
  unit: string
  dataTypes: string[]
  selectedDataType: string
  setDataType: (dataType: string) => void
  selectedTimeFrame: ChartTimeFrame
  setTimeFrame: (timeFrame: ChartTimeFrame) => void
}

export const PoolDetailsChart: React.FC<Props> = React.memo((props: Props): JSX.Element => {
  const {
    chartDetails: chartDetailsRD,
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

  const getChart = useCallback(
    (chartDetails: ChartDetails) => {
      const { labels, values }: PoolDetailsChartData = getChartData(chartDetails)
      const data = getDisplayData({ labels, values, colors })
      const options = getChartOptions({ unit, colors, isDesktopView })

      return chartType === 'bar' ? (
        <BarChart data={data} options={options} />
      ) : (
        <LineChart data={data} options={options} />
      )
    },
    [chartType, colors, isDesktopView, unit]
  )

  const renderChart = useMemo(
    () =>
      FP.pipe(
        chartDetailsRD,
        RD.fold(
          () => getChart(A.empty),
          () => <Spin />,
          (_) => <ErrorView title={intl.formatMessage({ id: 'common.error' })} />,
          (chartDetails) => getChart(chartDetails)
        )
      ),
    [chartDetailsRD, getChart, intl]
  )

  const renderHeader = useMemo(
    () => (
      <HeaderContainer>
        <TypeContainer>
          {dataTypes.map((dataType) => (
            <HeaderToggle
              primary={selectedDataType === dataType}
              key={`headerToggle${dataType}`}
              onClick={() => setDataType(dataType)}>
              {dataType}
            </HeaderToggle>
          ))}
        </TypeContainer>
        <TimeContainer>
          <HeaderToggle primary={selectedTimeFrame === 'week'} onClick={() => setTimeFrame('week')}>
            {intl.formatMessage({ id: 'common.time.week' })}
          </HeaderToggle>
          <HeaderToggle primary={selectedTimeFrame === 'allTime'} onClick={() => setTimeFrame('allTime')}>
            {intl.formatMessage({ id: 'common.time.all' })}
          </HeaderToggle>
        </TimeContainer>
      </HeaderContainer>
    ),
    [dataTypes, intl, selectedDataType, selectedTimeFrame, setDataType, setTimeFrame]
  )

  return (
    <ChartContainer gradientStart={colors.backgroundGradientStart} gradientStop={colors.backgroundGradientStop}>
      {renderHeader}
      <ChartWrapper>{renderChart}</ChartWrapper>
    </ChartContainer>
  )
})
