import { Address, Balance } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

type AccountType = {
  name: string
  address: string
  type: string
}

export type UserAccountType = {
  chainName: Chain
  accounts: AccountType[]
}

export type WalletBalance = Balance & { walletAddress: O.Option<Address> }
