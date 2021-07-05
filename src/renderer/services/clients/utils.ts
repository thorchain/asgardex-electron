import * as RD from '@devexperts/remote-data-ts'
import * as Client from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../shared/api/types'
import { ClientStateForViews, ClientState } from './types'

// TODO (@veado) Remove view states
export const getClientStateForViews = <C>(clientState: ClientState<C>): ClientStateForViews =>
  FP.pipe(
    clientState,
    RD.fold(
      // None -> 'notready'
      () => 'notready',
      () => 'pending',
      (_) => 'error',
      (_) => 'ready'
    )
  )

/**
 * Helper to type cast `Network` (ASGDX) -> `Client.Network` (xchain-client)
 */
export const toClientNetwork = (network: Network): Client.Network => network
