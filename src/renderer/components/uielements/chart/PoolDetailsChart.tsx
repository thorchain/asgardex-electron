import React, { useMemo } from 'react'

import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid } from 'antd'
import { useObservableState } from 'observable-hooks'

import { useThemeContext } from '../../../contexts/ThemeContext'
import { LoadingView } from '../../shared/loading'
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
import { ChartData, ChartTimeFrame } from './types'

type Props = {
  chartData: ChartData
  chartIndexes: string[]
  selectedIndex: string
  selectChart: (value: string) => void
}

const DefaultChart: React.FC<Props> = React.memo(
  (props: Props): JSX.Element => {
    const { chartIndexes = [], chartData, selectedIndex, selectChart } = props
    const [chartTimeframe, setChartTimeframe] = React.useState<ChartTimeFrame>('allTime')

    const isDesktopView = Grid.useBreakpoint()?.md ?? false

    const { themeType$ } = useThemeContext()
    const themeType = useObservableState(themeType$, ThemeType.LIGHT)
    const isLight = themeType === ThemeType.LIGHT
    const theme = isLight ? themes.light : themes.dark
    const colors = useMemo(() => getChartColors(theme, isLight), [theme, isLight])

    const { labels, values, unit, isChartLoading, selectedChartType } = getChartData({
      chartData,
      selectedIndex,
      chartTimeframe
    })

    const getData = useMemo(() => getDisplayData({ labels, values, colors }), [labels, values, colors])

    const options = useMemo(() => getChartOptions({ unit, colors, isDesktopView }), [unit, colors, isDesktopView])

    const renderChart = () => {
      if (isChartLoading) {
        return <LoadingView />
      }

      if (selectedChartType === 'bar') {
        return <BarChart data={getData} options={options} />
      }

      return <LineChart data={getData} options={options} />
    }

    const renderHeader = () => {
      return (
        <HeaderContainer>
          <TypeContainer>
            {chartIndexes.map((chartIndex) => (
              <HeaderToggle
                primary={selectedIndex === chartIndex}
                key={`headerToggle${chartIndex}`}
                onClick={() => selectChart(chartIndex)}>
                {chartIndex}
              </HeaderToggle>
            ))}
          </TypeContainer>
          <TimeContainer>
            <HeaderToggle primary={chartTimeframe === 'week'} onClick={() => setChartTimeframe('week')}>
              Week
            </HeaderToggle>
            <HeaderToggle primary={chartTimeframe === 'allTime'} onClick={() => setChartTimeframe('allTime')}>
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
