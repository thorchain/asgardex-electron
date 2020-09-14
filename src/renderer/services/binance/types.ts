import * as RD from '@devexperts/remote-data-ts'
import { Balances, BinanceClient, Transfer, Fees, TxPage } from '@thorchain/asgardex-binance'
import { Asset, AssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as Rx from 'rxjs'

import { ClientState } from '../types'

export type BalancesRD = RD.RemoteData<Error, Balances>

export type AssetWithPrice = {
  asset: Asset
  priceRune: BigNumber
}

export type AssetsWithPrice = AssetWithPrice[]

export type TxsRD = RD.RemoteData<Error, TxPage>

export type BinanceClientState = ClientState<BinanceClient>
export type BinanceClientState$ = Rx.Observable<ClientState<BinanceClient>>

export type TransferRD = RD.RemoteData<Error, Transfer>

export type FreezeAction = 'freeze' | 'unfreeze'
export type SendAction = 'send' | FreezeAction

// type guard to check possible values of `FreezeAction`
export const isSendAction = (action: string): action is SendAction => {
  switch (action) {
    case 'send':
    case 'freeze':
    case 'unfreeze':
      return true
    default:
      return false
  }
}

export type FreezeRD = RD.RemoteData<Error, Transfer>

export type FreezeTxParams = {
  amount: AssetAmount
  asset: Asset
  action: FreezeAction
}
export type AddressValidation = BinanceClient['validateAddress']

/**
 * Fees of Transfers
 * https://docs.binance.org/trading-spec.html#fees
 */
export type TransferFees = {
  /**
   * Fee of a transfer to a single address
   */
  single: AssetAmount
  /**
   * Multi send fee to muliple addresses
   * If the count of output address is bigger than the threshold, currently it's 2,
   * then the total transaction fee is 0.0003 BNB per token per address.
   * https://docs.binance.org/trading-spec.html#multi-send-fees
   */
  multi: AssetAmount
}

export type FeeRD = RD.RemoteData<Error, AssetAmount>
export type FeesRD = RD.RemoteData<Error, Fees>
export type TransferFeesRD = RD.RemoteData<Error, TransferFees>

export type LoadTxsProps = {
  limit: number
  offset: number
}

export type ApiId = 'BNB'
