import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import * as E from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
import { Option, option } from 'fp-ts/lib/Option'

/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type BitcoinClientState = Option<E.Either<Error, BitcoinClient>>

// Something like `EitherT<Option>` Monad
export const BitcoinClientStateM = getEitherM(option)

export type BitcoinClientStateForViews = 'notready' | 'ready' | 'error'
