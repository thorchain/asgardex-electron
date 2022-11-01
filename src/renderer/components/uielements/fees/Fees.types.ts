import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type UIFee = {
  amount: BaseAmount
  asset: Asset
}

export type UISwapFees = {
  inbound: UIFee
  priceInbound: UIFee
  outbound: UIFee
  priceOutbound: UIFee
}

export type UIFees = UIFee[]

export type UIFeesRD = RD.RemoteData<Error, UIFees>
export type UISwapFeesRD = RD.RemoteData<Error, UISwapFees>
