import * as RD from '@devexperts/remote-data-ts'
import { AssetAmount } from '@xchainjs/xchain-util'

export type ChartDetail = {
  amount: AssetAmount
  time: number
}

export type ChartDetails = ChartDetail[]
export type ChartDetailsRD = RD.RemoteData<Error, ChartDetails>

export type ChartDataType = 'liquidity' | 'volume'

export type ChartType = 'line' | 'bar'

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
}

export type ChartOptionsParams = {
  unit: string
  colors: DisplayDataColor
  isDesktopView: boolean
}
