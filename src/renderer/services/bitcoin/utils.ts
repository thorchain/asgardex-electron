import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BitcoinClientState, BitcoinClientStateM, BitcoinClientStateForViews } from './types'

export const getBitcoinClient = (clientState: BitcoinClientState): O.Option<BitcoinClient> =>
  BitcoinClientStateM.getOrElse(clientState, () => O.none)

export const getBitcoinClientStateForViews = (clientState: BitcoinClientState): BitcoinClientStateForViews =>
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
