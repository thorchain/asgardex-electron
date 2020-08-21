import * as RD from '@devexperts/remote-data-ts'
import { Balances, BinanceClient, Txs, Transfer, Fees } from '@thorchain/asgardex-binance'
import { Asset, AssetAmount, BaseAmount } from '@thorchain/asgardex-util'
import * as E from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
import * as O from 'fp-ts/lib/Option'
import { Option, option } from 'fp-ts/lib/Option'

export type BalancesRD = RD.RemoteData<Error, Balances>

export type AssetWithBalance = {
  asset: Asset
  balance: AssetAmount
  frozenBalance?: AssetAmount
}

export type AssetsWithBalance = AssetWithBalance[]

export type AssetsWithBalanceRD = RD.RemoteData<Error, AssetsWithBalance>

export type TxsRD = RD.RemoteData<Error, Txs>

/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type BinanceClientState = Option<E.Either<Error, BinanceClient>>

// Something like `EitherT<Option>` Monad
export const BinanceClientStateM = getEitherM(option)

export type BinanceClientStateForViews = 'notready' | 'ready' | 'error'

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
  single: BaseAmount
  /**
   * Multi send fee to muliple addresses
   * If the count of output address is bigger than the threshold, currently it's 2,
   * then the total transaction fee is 0.0003 BNB per token per address.
   * https://docs.binance.org/trading-spec.html#multi-send-fees
   */
  multi: BaseAmount
}

export type FeesRD = RD.RemoteData<Error, Fees>
export type TransferFeesRD = RD.RemoteData<Error, O.Option<TransferFees>>
