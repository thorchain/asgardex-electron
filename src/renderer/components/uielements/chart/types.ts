export type ChartDetail = {
  value: string
  time: number
}

export type ChartValues = {
  allTime: ChartDetail[]
  week: ChartDetail[]
}

export type ChartView = 'line' | 'bar'

export type ChartObject = {
  values?: ChartValues
  loading?: boolean
  comingSoon?: boolean
  type?: ChartView
  unit?: string
}

export type ChartData = {
  [key: string]: ChartObject
}

export type ChartTimeFrame = 'allTime' | 'week'

export type DisplayDataColor = {
  text: string
  line: string
  backgroundGradientStart: string
  backgroundGradientStop: string
  gradientStart: string
  gradientStop: string
}

export type DisplayDataParams = {
  labels: string[]
  values: number[]
  colors: DisplayDataColor
}
