import { random } from 'lodash'
import moment from 'moment'

import { DisplayDataParams } from './types'

export const generateRandomTimeSeries = (minValue: number, maxValue: number) => {
  const series = []
  for (let itr = moment().subtract(15, 'days'); itr.isBefore(moment.now()); itr = itr.add(1, 'day')) {
    series.push({
      time: itr.unix(),
      value: (minValue + (random(100) / 100) * (maxValue - minValue)).toString()
    })
  }
  return series
}

export const getRandomChartData = () => {
  const randomSeries = generateRandomTimeSeries(0, 15)

  const labels: Array<string> = randomSeries.map((data) => {
    return moment.unix(data.time).format('MMM DD')
  })

  const values: Array<number> = randomSeries.map((data) => Number(data.value.split(',').join('')))

  return {
    labels,
    values
  }
}

export const getDisplayData = ({ labels, values, colors }: DisplayDataParams) => (canvas: HTMLCanvasElement) => {
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
