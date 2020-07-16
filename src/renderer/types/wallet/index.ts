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
  _id?: number
  chainName: string
  accounts: AccountType[]
}

export type UserTransactionType = {
  _id?: number
  blockHeight?: number | null
  code?: number | null
  confirmBlocks?: number | null
  data?: string | null
  memo?: string | null
  orderId?: number | null
  proposalId?: string | null
  sequence?: number | null
  source?: number | null
  timeStamp?: string | null
  fromAddr?: string | null
  toAddr?: string | null
  txAge?: number | null
  txAsset: string
  txFee: string
  txHash: string
  txType: string
  value: string
}

export type TransactionPartyType = {
  msg: string
  label: string
  address?: string | null
  timeStamp?: string | null
  color: string
  op: string
}
