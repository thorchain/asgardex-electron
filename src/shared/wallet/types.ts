import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

export type WalletType = 'keystore' | 'ledger'

export type WalletAddress = { address: Address; type: WalletType; chain: Chain }
export type WalletAddresses = WalletAddress[]
