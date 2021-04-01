import React, { useMemo } from 'react'

import themes, { ThemeType } from '@thorchain/asgardex-theme'
import { Grid } from 'antd'
import moment from 'moment'
import { useObservableState } from 'observable-hooks'
import { defaults } from 'react-chartjs-2'

import { useThemeContext } from '../../../contexts/ThemeContext'
import { abbreviateNumber } from '../../../helpers/numberHelper'
import { LoadingView } from '../../shared/loading'
import {
  ChartContainer,
  HeaderContainer,
  TypeContainer,
  TimeContainer,
  HeaderToggle,
  ChartWrapper,
  BarChart,
  LineChart
} from './chart.style'
import { ChartData, ChartTimeFrame } from './types'
import { getDisplayData } from './utils'

type Props = {
  chartData: ChartData
  chartIndexes: string[]
  selectedIndex: string
  selectChart: (value: string) => void
}

// https://www.chartjs.org/docs/latest/general/fonts.html#missing-fonts
defaults.global.defaultFontSize = 14
defaults.global.defaultFontStyle = 'normal'

const DefaultChart: React.FC<Props> = React.memo(
  (props: Props): JSX.Element => {
    const { chartIndexes = [], chartData, selectedIndex, selectChart } = props
    const [chartTimeframe, setChartTimeframe] = React.useState<ChartTimeFrame>('allTime')

    const isDesktopView = Grid.useBreakpoint()?.md ?? false

    const { themeType$ } = useThemeContext()
    const themeType = useObservableState(themeType$)
    const isLight = themeType === ThemeType.LIGHT
    const theme = isLight ? themes.light : themes.dark
    const colors = useMemo(
      () => ({
        text: theme.palette.text[0],
        line: isLight ? '#23DCC8' : '#23DCC8',
        backgroundGradientStart: isLight ? '#c8fffa' : '#186b63',
        backgroundGradientStop: isLight ? '#ffffff' : '#23DCC8',
        gradientStart: isLight ? '#23DCC8' : '#186b63',
        gradientStop: isLight ? '#ffffff' : '#23dcca'
      }),
      [isLight, theme]
    )

    const selectedChartData = chartData?.[selectedIndex]
    const isChartLoading = selectedChartData?.loading ?? false
    const selectedChartType = selectedChartData?.type ?? 'bar'
    const selectedChartValues = selectedChartData?.values
    const unit = selectedChartData?.unit ?? ''
    const filteredByTime = selectedChartValues?.[chartTimeframe] ?? []

    const labels: Array<string> = filteredByTime.map((data) => {
      return moment.unix(data.time).format('MMM DD')
    })

    const values: Array<number> = filteredByTime.map((data) => Number(data.value.split(',').join('')))

    const getData = useMemo(() => getDisplayData({ labels, values, colors }), [labels, values, colors])

    const options = useMemo(
      () => ({
        maintainAspectRatio: false,
        title: {
          display: false
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: '10px',
            right: '10px',
            top: '10px',
            bottom: '10px'
          }
        },
        animation: {
          duration: 0
        },
        tooltips: {
          titleFontSize: 18,
          bodyFontSize: 16,
          callbacks: {
            label: ({ yLabel }: { yLabel: number }) => {
              // if greater than 100M
              if (yLabel > 100000000) {
                return `${unit}${abbreviateNumber(yLabel, 0)}`
              }
              const label = `${unit}${new Intl.NumberFormat().format(Math.floor(yLabel))}`
              return label
            }
          }
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              },
              ticks: {
                fontSize: 14,
                fontColor: colors.text,
                maxTicksLimit: isDesktopView ? 5 : 3,
                autoSkipPadding: 5,
                maxRotation: 0,
                callback(value: string) {
                  if (Number(value) === 0) {
                    return '0'
                  }
                  return value
                }
              }
            }
          ],
          yAxes: [
            {
              type: 'linear',
              stacked: true,
              id: 'value',
              ticks: {
                autoSkip: true,
                maxTicksLimit: isDesktopView ? 4 : 3,
                callback(value: string) {
                  if (Number(value) === 0) {
                    return `${unit}0`
                  }
                  return `${unit}${abbreviateNumber(Number(value))}`
                },
                padding: 10,
                fontSize: 14,
                fontColor: colors.text
              },
              gridLines: {
                display: false
              }
            }
          ]
        }
      }),
      [unit, colors, isDesktopView]
    )

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
