import { Chain } from '@xchainjs/xchain-util'

import { WalletAddress } from '../../../../shared/wallet/types'
import { PoolDetailRD } from '../../../services/midgard/types'
import { MimirHalt } from '../../../services/thorchain/types'
import { AssetWithDecimal } from '../../../types/asgardex'

export type Props = {
  asset: AssetWithDecimal
  poolDetail: PoolDetailRD
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  runeWalletAddress: WalletAddress
  assetWalletAddress: WalletAddress
}
