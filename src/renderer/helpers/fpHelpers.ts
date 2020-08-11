import * as RD from '@devexperts/remote-data-ts'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as O from 'fp-ts/lib/Option'

export const sequenceTOption = sequenceT(O.option)

export const _sequenceTRD = sequenceT(RD.remoteData)
export const sequenceTRD = <E, A>(onEmpty: () => E) => ([first, ...rest]: RD.RemoteData<E, A>[]): RD.RemoteData<
  E,
  A[]
> => {
  if (!first) {
    return RD.failure(onEmpty())
  }
  return _sequenceTRD(first, ...rest)
}
