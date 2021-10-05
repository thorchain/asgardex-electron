import * as RD from '@devexperts/remote-data-ts'
import { Lazy } from 'fp-ts/function'
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'

/**
 * Sequence
 */

export const sequenceTOption = sequenceT(O.Apply)
export const sequenceTOptionFromArray = A.sequence(O.Applicative)
export const sequenceSOption = sequenceS(O.Applicative)

export const sequenceTRD = sequenceT(RD.remoteData)
export const sequenceTRDFromArray = A.sequence(RD.remoteData)

/**
 * Creation
 */
export const rdFromOption =
  <L, A>(onNone: Lazy<L>) =>
  (v: O.Option<A>) =>
    RD.fromOption(v, onNone)

export const rdAltOnPending =
  <L, A>(onPending: () => RD.RemoteData<L, A>) =>
  (rd: RD.RemoteData<L, A>): RD.RemoteData<L, A> => {
    if (RD.isPending(rd)) {
      return onPending()
    }
    return rd
  }
