import * as RD from '@devexperts/remote-data-ts'
import { Balances, BinanceClient } from '@thorchain/asgardex-binance'
import { Either } from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'

export type BalancesRD = RD.RemoteData<Error, Balances>
/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type BinanceClientState = Option<Either<Error, BinanceClient>>

export type BinanceClientStateForViews = 'notready' | 'ready' | 'error'
