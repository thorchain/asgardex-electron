import { Asset } from '@xchainjs/xchain-util'

export type PoolShare = {
  asset: Asset
  ownership: number
  value: number
}
