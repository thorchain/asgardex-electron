import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { PoolDetailRD } from '../../../services/midgard/types'
import { MimirHalt } from '../../../services/thorchain/types'
import { AssetWithDecimal } from '../../../types/asgardex'

export type Props = {
  asset: AssetWithDecimal
  poolDetail: PoolDetailRD
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  runeWalletAddress: Address
  assetWalletAddress: Address
}
