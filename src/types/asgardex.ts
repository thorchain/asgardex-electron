import BigNumber from 'bignumber.js'
import { Option } from 'fp-ts/lib/Option'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FixmeType = any

export type Pair = {
  source: Option<string>
  target: Option<string>
}

export type AssetPair = {
  asset: string
  price: BigNumber
}
