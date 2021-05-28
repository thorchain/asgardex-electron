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
import * as Styled from './PoolDetailsChart.styles'
import {
  ChartDataType,
  ChartDetails,
  ChartDetailsRD,
  ChartTimeFrame,
  ChartType,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

type Props = {
  chartDetails: ChartDetailsRD
  chartType: ChartType
  unit: string
  dataTypes: ChartDataType[]
  selectedDataType: ChartDataType
  setDataType: (dataType: ChartDataType) => void
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
        <Styled.BarChart data={data} options={options} />
      ) : (
        <Styled.LineChart data={data} options={options} />
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
    ),
    [dataTypes, intl, selectedDataType, selectedTimeFrame, setDataType, setTimeFrame]
  )

  return (
    <Styled.ChartContainer gradientStart={colors.backgroundGradientStart} gradientStop={colors.backgroundGradientStop}>
      {renderHeader}
      <Styled.ChartWrapper>{renderChart}</Styled.ChartWrapper>
    </Styled.ChartContainer>
  )
})
