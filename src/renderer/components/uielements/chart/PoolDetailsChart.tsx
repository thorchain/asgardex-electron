import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid, Spin } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
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

export const PoolDetailsChart: React.FC<Props> = React.memo((props: Props): JSX.Element => {
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
    () => (
      <Styled.ChartContainer
        gradientStart={colors.backgroundGradientStart}
        gradientStop={colors.backgroundGradientStop}>
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
              () => getChart([]),
              () => <Spin />,
              // no error rendering needed here - it's already done in last `render`
              () => <></>,
              getChart
            )
          )}
        </Styled.ChartWrapper>
      </Styled.ChartContainer>
    ),
    [
      chartDetailsRD,
      colors.backgroundGradientStart,
      colors.backgroundGradientStop,
      dataTypes,
      getChart,
      intl,
      selectedDataType,
      selectedTimeFrame,
      setDataType,
      setTimeFrame
    ]
  )

  const renderError = useCallback(
    (error: Error) => (
      <Styled.ErrorView
        title={intl.formatMessage({ id: 'common.error' })}
        subTitle={error?.message ?? error.toString()}
        extra={<Button onClick={reloadData}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
      />
    ),
    [intl, reloadData]
  )

  return FP.pipe(
    chartDetailsRD,
    RD.fold(
      () => renderChart,
      () => renderChart,
      renderError,
      () => renderChart
    )
  )
})
