import { Theme } from '@thorchain/asgardex-theme'
import moment from 'moment'

import { abbreviateNumber } from '../../../helpers/numberHelper'
import { ChartDetails, ChartOptionsParams, DisplayDataColor, DisplayDataParams, PoolDetailsChartData } from './types'

export const getChartColors = (theme: Theme, isLight: boolean): DisplayDataColor => ({
  text: theme.palette.text[0],
  line: isLight ? '#23DCC8' : '#23DCC8',
  backgroundGradientStart: isLight ? '#c8fffa' : '#186b63',
  backgroundGradientStop: isLight ? '#ffffff' : '#23DCC8',
  gradientStart: isLight ? '#23DCC8' : '#186b63',
  gradientStop: isLight ? '#ffffff' : '#23dcca'
})

export const getDisplayData =
  ({ labels, values, colors }: DisplayDataParams) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    let gradientStroke: CanvasGradient

    if (ctx) {
      gradientStroke = ctx.createLinearGradient(0, 100, 0, 300)
      gradientStroke.addColorStop(0, colors.gradientStart)
      gradientStroke.addColorStop(1, colors.gradientStop)
      return {
        labels,
        datasets: [
          {
            fill: true,
            lineTension: 0.5,
            backgroundColor: gradientStroke,
            borderColor: colors.line,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            borderWidth: 2,
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
      }
    }

    return {
      labels,
      datasets: [
        {
          fill: false,
          lineTension: 0.2,
          borderColor: '#436eb9',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          borderWidth: 2,
          pointBorderColor: '#436eb9',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 1,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 0,
          pointRadius: 1,
          pointHitRadius: 50,
          data: values
        }
      ]
    }
  }

export const getChartData = (chartValues: ChartDetails): PoolDetailsChartData => {
  const labels: Array<string> =
    chartValues.map((data) => {
      return moment.unix(data.time).format('MMM DD')
    }) || []

  const values: Array<number> = chartValues.map((data) => Number(data.value.split(',').join(''))) || []

  return {
    labels,
    values
  }
}

export const getChartOptions = ({ unit, colors, isDesktopView }: ChartOptionsParams) => ({
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
})
