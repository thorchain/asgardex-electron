import * as RD from '@devexperts/remote-data-ts'
import { Lazy } from 'fp-ts/function'
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply'
import { array } from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'

/**
 * Sequence
 */

export const sequenceTOption = sequenceT(O.option)
export const sequenceTOptionFromArray = array.sequence(O.option)
export const sequenceSOption = sequenceS(O.Applicative)

export const sequenceTRD = sequenceT(RD.remoteData)
export const sequenceTRDFromArray = array.sequence(RD.remoteData)

/**
 * Creation
 */
export const rdFromOption = <L, A>(onNone: Lazy<L>) => (v: O.Option<A>) => RD.fromOption(v, onNone)
