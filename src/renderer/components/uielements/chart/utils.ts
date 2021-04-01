import { DisplayDataParams } from './types'

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
