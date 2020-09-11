import * as RD from '@devexperts/remote-data-ts'
import { Lazy } from 'fp-ts/function'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as O from 'fp-ts/lib/Option'

/**
 * Sequence
 */

export const sequenceTOption = sequenceT(O.option)
export const sequenceTOptionFromArray = <A>([first, ...rest]: O.Option<A>[]): O.Option<A[]> => {
  if (!first) {
    return O.none
  }

  return sequenceTOption(first, ...rest)
}
export const sequenceTRD = sequenceT(RD.remoteData)
export const sequenceTRDFromArray = <E, A>(onEmpty: () => E) => ([first, ...rest]: RD.RemoteData<
  E,
  A
>[]): RD.RemoteData<E, A[]> => {
  if (!first) {
    return RD.failure(onEmpty())
  }
  return sequenceTRD(first, ...rest)
}

/**
 * Creation
 */
export const rdFromOption = <L, A>(onNone: Lazy<L>) => (v: O.Option<A>) => RD.fromOption(v, onNone)
