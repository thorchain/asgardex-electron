import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { WalletType } from '../../services/wallet/types'

export type AccountAddressSelectorType = {
  walletAddress: Address
  walletType: WalletType
  chain: Chain
}
