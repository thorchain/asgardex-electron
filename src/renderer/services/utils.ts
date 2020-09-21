import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ClientStateM, ClientStateForViews, ClientState, ChainId } from './types'

export const getClient = <C>(clientState: ClientState<C>): O.Option<C> =>
  ClientStateM.getOrElse(clientState, () => O.none)

export const hasClient = <C>(clientState: ClientState<C>): boolean => FP.pipe(clientState, getClient, O.isSome)

export const getClientStateForViews = <C>(clientState: ClientState<C>): ClientStateForViews =>
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

export const chainIdToString = (chainId: ChainId) => {
  switch (chainId) {
    case 'Thorchain':
      return 'Thorchain'
    case 'BTC':
      return 'Bitcoin'
    case 'ETH':
      return 'Ethereum'
    case 'Binance':
      return 'Binance Chain'
    default:
      return 'unknown chain'
  }
}
