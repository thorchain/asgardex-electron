import { Theme } from '@thorchain/asgardex-theme'
import type { ChartOptions } from 'chart.js'
import dayjs from 'dayjs'

import { abbreviateNumber } from '../../../helpers/numberHelper'
import {
  ChartDetails,
  ChartOptionsParams,
  DisplayDataColor,
  DisplayDataParams,
  PoolDetailsChartData
} from './PoolDetailsChart.types'

export const getChartColors = (theme: Theme, isLight: boolean): DisplayDataColor => ({
  text: theme.palette.text[0],
  line: '#23DCC8',
  backgroundGradientStart: isLight ? '#c8fffa' : '#186b63',
  backgroundGradientStop: isLight ? '#ffffff' : '#23DCC8',
  gradientStart: isLight ? '#23DCC8' : '#186b63',
  gradientStop: isLight ? '#ffffff' : '#23dcca'
})

export const getDisplayData = ({ labels, values, colors }: DisplayDataParams) => {
  const data = (gradientStroke?: CanvasGradient) => ({
    labels,
    datasets: [
      {
        fill: true,
        lineTension: 0.5,
        backgroundColor: gradientStroke || '',
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

  return data()
}

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

export const getChartOptions = ({ unit, colors, isDesktopView }: ChartOptionsParams): ChartOptions => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      titleFont: { family: 'MainFontRegular', size: 16 },
      bodyFont: { family: 'MainFontRegular', size: 14 },
      callbacks: {
        label: (context) => {
          const label = Number(context.dataset.data[context.dataIndex]) || 0
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
        callback: (tickValue): string => {
          if (Number(tickValue) === 0) {
            return `${unit}0`
          }
          return `${unit}${abbreviateNumber(Number(tickValue))}`
        },
        color: colors.text
      }
    }
  }
})
