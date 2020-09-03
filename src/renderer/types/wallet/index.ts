import { Asset } from '@thorchain/asgardex-util'

export type UserAssetType = {
  _id?: string
  name?: string
  value?: number
  asset: Asset
  full?: number
  free: number
  frozen: number
  locked: number
}

type AccountType = {
  name: string
  address: string
  type: string
}

export type UserAccountType = {
  chainName: string
  accounts: AccountType[]
}
