import { Chain } from '../../../../shared/utils/chain'
import { WalletAddress } from '../../../../shared/wallet/types'
import { PoolDetailRD, PoolShareRD } from '../../../services/midgard/types'
import { MimirHalt } from '../../../services/thorchain/types'
import { AssetWithDecimal } from '../../../types/asgardex'

export type Props = {
  asset: AssetWithDecimal
  poolShare: PoolShareRD
  poolDetail: PoolDetailRD
  runeWalletAddress: WalletAddress
  assetWalletAddress: WalletAddress
  haltedChains: Chain[]
  mimirHalt: MimirHalt
}
