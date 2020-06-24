import * as RD from '@devexperts/remote-data-ts'
import { Balances } from '@thorchain/asgardex-binance'
import { Either } from 'fp-ts/lib/Either'

export type BalancesRD = RD.RemoteData<Error, Balances>

export type BinanceClientReadyState = 'ready' | 'notready'
export type BinanceClientState = Either<Error, BinanceClientReadyState>
