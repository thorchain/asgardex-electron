import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

/**
 * timeStamp will be rounded-down based on roundBasis
 * @example roundUnixTimestampToMinutes(5)(345) === O.some(300)
 * @param roundBasis - basis in minutes to round-down to
 */
export const roundUnixTimestampToMinutes = (roundBasis = 5) => (timeStamp?: number): O.Option<number> =>
  FP.pipe(
    timeStamp,
    O.fromNullable,
    O.map((timeStamp) => timeStamp - (timeStamp % (roundBasis * 60)))
  )
