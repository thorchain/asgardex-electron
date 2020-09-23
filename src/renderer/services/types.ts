import * as E from 'fp-ts/lib/Either'
import { getEitherM } from 'fp-ts/lib/EitherT'
import { Option, option } from 'fp-ts/lib/Option'

/**
 * Three States:
 * (1) None -> no client has been instantiated
 * (2) Some(Right) -> A client has been instantiated
 * (3) Some(Left) -> An error while trying to instantiate a client
 */
export type ClientState<C> = Option<E.Either<Error, C>>

// Something like `EitherT<Option>` Monad
export const ClientStateM = getEitherM(option)

export type ClientStateForViews = 'notready' | 'ready' | 'error'
