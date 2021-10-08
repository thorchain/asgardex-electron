import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { WalletType } from '../../../shared/wallet/types'

export type AccountAddressSelectorType = {
  walletAddress: Address
  walletType: WalletType
  chain: Chain
}
