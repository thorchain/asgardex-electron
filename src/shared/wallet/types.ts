import { Address } from '@xchainjs/xchain-util'

import { EthHDMode } from '../ethereum/types'
import { Chain } from '../utils/chain'

export type WalletType = 'keystore' | 'ledger'

export type WalletBalanceType = 'all' | 'confirmed'

export type HDMode = 'default' | EthHDMode

export type WalletAddress = { address: Address; type: WalletType; chain: Chain; walletIndex: number; hdMode: HDMode }
export type WalletAddresses = WalletAddress[]
