import React, { useMemo } from 'react'

import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid, Spin } from 'antd'
import { useObservableState } from 'observable-hooks'

import { useThemeContext } from '../../../contexts/ThemeContext'
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
import { ChartDetail, ChartTimeFrame, ChartView } from './types'

type Props = {
  chartValues: ChartDetail[]
  isLoading: boolean
  chartType: ChartView
  unit: string
  dataTypes: string[]
  selectedDataType: string
  setDataType: (dataType: string) => void
  selectedTimeFrame: ChartTimeFrame
  setTimeFrame: (timeFrame: ChartTimeFrame) => void
}

const DefaultChart: React.FC<Props> = React.memo(
  (props: Props): JSX.Element => {
    const {
      chartValues,
      isLoading,
      chartType,
      unit,
      dataTypes,
      selectedDataType,
      selectedTimeFrame,
      setDataType,
      setTimeFrame
    } = props

    const isDesktopView = Grid.useBreakpoint()?.md ?? false

    const { themeType$ } = useThemeContext()
    const themeType = useObservableState(themeType$, ThemeType.LIGHT)
    const isLight = themeType === ThemeType.LIGHT
    const theme = isLight ? themes.light : themes.dark
    const colors = useMemo(() => getChartColors(theme, isLight), [theme, isLight])

    const { labels, values } = getChartData(chartValues)

    const getData = useMemo(() => getDisplayData({ labels, values, colors }), [labels, values, colors])

    const options = useMemo(() => getChartOptions({ unit, colors, isDesktopView }), [unit, colors, isDesktopView])

    const renderChart = () => {
      if (isLoading) {
        return <Spin />
      }

      if (chartType === 'bar') {
        return <BarChart data={getData} options={options} />
      }

      return <LineChart data={getData} options={options} />
    }

    const renderHeader = () => {
      return (
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
              Week
            </HeaderToggle>
            <HeaderToggle primary={selectedTimeFrame === 'allTime'} onClick={() => setTimeFrame('allTime')}>
              All
            </HeaderToggle>
          </TimeContainer>
        </HeaderContainer>
      )
    }

    return (
      <ChartContainer gradientStart={colors.backgroundGradientStart} gradientStop={colors.backgroundGradientStop}>
        {renderHeader()}
        <ChartWrapper>{renderChart()}</ChartWrapper>
      </ChartContainer>
    )
  }
)

export default DefaultChart
