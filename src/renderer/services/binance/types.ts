import * as RD from '@devexperts/remote-data-ts'
import { Balances, BinanceClient, Txs } from '@thorchain/asgardex-binance'
import { Asset, AssetAmount } from '@thorchain/asgardex-util'
import { Either } from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
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
export type BinanceClientState = Option<Either<Error, BinanceClient>>

// Something like `EitherT<Option>` Monad
export const BinanceClientStateM = getEitherM(option)

export type BinanceClientStateForViews = 'notready' | 'ready' | 'error'
