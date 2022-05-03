import { Theme } from '@thorchain/asgardex-theme'
import { ChartDataset, TooltipItem } from 'chart.js'
import type { ChartType } from 'chart.js'
import dayjs from 'dayjs'

import { abbreviateNumber } from '../../../helpers/numberHelper'
import {
  ChartDetails,
  ChartOptionsParams,
  DisplayDataColor,
  DisplayDataParams,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

export const getChartColors = (theme: Theme): DisplayDataColor => ({
  text: theme.palette.text[0],
  line: theme.palette.primary[0],
  gradientStart: theme.palette.primary[0],
  gradientStop: theme.palette.background[0]
})

export const getDisplayData = ({ labels, values, colors }: DisplayDataParams) => ({
  labels,
  datasets: [
    {
      fill: true,
      lineTension: 0.5,
      borderColor: colors.line,
      borderCapStyle: 'butt' as CanvasLineCap,
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter' as CanvasLineJoin,
      borderWidth: 1,
      pointBorderColor: colors.line,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 1,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 1,
      pointRadius: 1,
      pointHitRadius: 50,
      data: values
    }
  ]
})

export const getChartData = (chartValues: ChartDetails): PoolDetailsChartData => {
  const labels: Array<string> =
    chartValues.map((data) => {
      return dayjs.unix(data.time).format('MMM DD')
    }) || []

  const values: Array<number> = chartValues.map(({ amount }) => amount.amount().toNumber()) || []

  return {
    labels,
    values
  }
}

export const getChartOptions = <T extends ChartType = 'bar' | 'line'>({
  unit,
  colors,
  isDesktopView
}: ChartOptionsParams) => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      titleFont: { family: 'MainFontRegular', size: 16 },
      bodyFont: { family: 'MainFontRegular', size: 14 },
      callbacks: {
        label: ({ dataset, dataIndex, label: _label }: TooltipItem<T>) => {
          // we do need to force the type here :(
          const label = (dataset as ChartDataset<T, number[]>).data[dataIndex]
          // if greater than 100M
          if (label > 100000000) {
            return `${unit}${abbreviateNumber(label, 0)}`
          }
          return `${unit}${new Intl.NumberFormat().format(Math.floor(label))}`
        }
      }
    }
  },
  animation: {
    duration: 0
  },
  scales: {
    x: {
      grid: {
        display: false,
        borderWidth: 0
      },
      ticks: {
        color: colors.text,
        maxTicksLimit: isDesktopView ? 5 : 3,
        maxRotation: 0
      }
    },
    y: {
      grid: {
        display: false,
        borderWidth: 0
      },
      stacked: true,
      ticks: {
        autoSkip: true,
        maxTicksLimit: isDesktopView ? 4 : 3,
        callback: (tickValue: number | string): string => {
          const value = Number(tickValue)
          if (value === 0) {
            return `${unit}0`
          }
          return `${unit}${abbreviateNumber(value)}`
        },
        color: colors.text
      }
    }
  }
})
