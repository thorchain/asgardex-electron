export type UserAssetType = {
  _id?: string
  name?: string
  value?: number
  symbol: string
  full?: number
  free: number
  frozen: number
  locked: number
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
  color: string
  op: string
}
