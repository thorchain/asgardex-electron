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
