export type ChartDetail = {
  value: string
  time: number
}

export type ChartView = 'line' | 'bar'

export type ChartObject = {
  values?: ChartDetail[]
  loading?: boolean
  type?: ChartView
  unit?: string
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

export type PoolDetailsChartData = {
  labels: Array<string>
  values: Array<number>
  unit: string
  isChartLoading: boolean
  selectedChartType: ChartView
}

export type ChartOptionsParams = {
  unit: string
  colors: DisplayDataColor
  isDesktopView: boolean
}
