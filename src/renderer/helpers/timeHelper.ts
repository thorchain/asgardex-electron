/**
 *
 * timeStamp will be rounded-down based on roundBasis
 * @example roundUnixTimestampToMinutes(5)(345) === 300
 * @param roundBasis - basis in minutes to round-down to
 */
export const roundUnixTimestampToMinutes = (roundBasis = 5) => (timeStamp?: number) => {
  return timeStamp ? timeStamp - (timeStamp % (roundBasis * 60)) : timeStamp
}
