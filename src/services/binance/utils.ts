import { BinanceClient } from '@thorchain/asgardex-binance'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BinanceClientState, BinanceClientStateM, BinanceClientStateForViews } from './types'

export const getBinanceClient = (clientState: BinanceClientState): O.Option<BinanceClient> =>
  BinanceClientStateM.getOrElse(clientState, () => O.none)

export const hasBinanceClient = (clientState: BinanceClientState): boolean =>
  FP.pipe(clientState, getBinanceClient, O.isSome)

export const getBinanceClientStateForViews = (clientState: BinanceClientState): BinanceClientStateForViews =>
  FP.pipe(
    clientState,
    O.fold(
      // None -> 'notready'
      () => 'notready',
      // Check inner values of Some<Either>
      // Some<Left<Error>> -> 'error
      // Some<Right<BinanceClient>> -> 'ready
      FP.flow(
        E.fold(
          (_) => 'error',
          (_) => 'ready'
        )
      )
    )
  )
