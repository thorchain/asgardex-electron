import { Asset } from '@thorchain/asgardex-util'

export type StakeType = 'sym' | 'asym'

export type Props = {
  asset: Asset
  runeAsset: Asset
  type: StakeType
}
