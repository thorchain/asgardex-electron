import { Theme } from '@thorchain/asgardex-theme'
import { ChartOptions } from 'chart.js'
import moment from 'moment'

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

export const getDisplayData =
  ({ labels, values, colors }: DisplayDataParams) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')

    const data = (gradientStroke?: CanvasGradient) => ({
      labels,
      datasets: [
        {
          fill: true,
          lineTension: 0.5,
          backgroundColor: gradientStroke || '',
          borderColor: colors.line,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
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

    if (ctx) {
      const gradientStroke: CanvasGradient = ctx.createLinearGradient(0, 100, 0, 300)
      gradientStroke.addColorStop(0, colors.gradientStart)
      gradientStroke.addColorStop(1, colors.gradientStop)
      return data(gradientStroke)
    }

    return data()
  }

export const getChartData = (chartValues: ChartDetails): PoolDetailsChartData => {
  const labels: Array<string> =
    chartValues.map((data) => {
      return moment.unix(data.time).format('MMM DD')
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
