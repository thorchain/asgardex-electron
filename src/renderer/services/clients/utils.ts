import * as Client from '@xchainjs/xchain-client'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { ClientStateM, ClientStateForViews, ClientState } from './types'

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

/**
 * Helper to transform `Network` (ASGDX) -> `Client.Network` (xchain-client)
 * Note In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
 */
export const getClientNetwork = (network: Network): Client.Network => (network === 'testnet' ? 'testnet' : 'mainnet')
