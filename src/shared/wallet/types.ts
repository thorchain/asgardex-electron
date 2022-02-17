import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

export type WalletType = 'keystore' | 'ledger'

export type WalletBalanceType = 'all' | 'confirmed'

export type WalletAddress = { address: Address; type: WalletType; chain: Chain; walletIndex: number }
export type WalletAddresses = WalletAddress[]
