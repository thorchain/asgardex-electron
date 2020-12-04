import { Balance } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

type AccountType = {
  name: string
  address: string
  type: string
}

export type UserAccountType = {
  chainName: Chain
  accounts: AccountType[]
}

export type WalletBalance = Balance & { wallet: string }
