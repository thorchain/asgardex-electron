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

export type ChartDataParams = {
  chartData: ChartData
  selectedIndex: string
  chartTimeframe: ChartTimeFrame
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
