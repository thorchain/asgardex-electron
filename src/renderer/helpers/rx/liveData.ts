import { remoteData, RemoteData, failure, isSuccess } from '@devexperts/remote-data-ts'
import { instanceObservable } from '@devexperts/rx-utils/dist/observable.utils'
import { getLiveDataM } from '@devexperts/utils/dist/adt/live-data.utils'
import { FoldableValue2 } from '@devexperts/utils/dist/typeclasses/foldable-value/foldable-value'
import {
  CoproductLeft,
  coproductMapLeft
} from '@devexperts/utils/dist/typeclasses/product-left-coproduct-left/product-left-coproduct-left.utils'
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply'
import { array } from 'fp-ts/lib/Array'
import { Filterable2 } from 'fp-ts/lib/Filterable'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Observable } from 'rxjs'

export type LiveData<E, A> = Observable<RemoteData<E, A>>

export const URI = '//LiveData'
export type URIType = typeof URI
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    [URI]: LiveData<E, A>
  }
}

const foldableValueRemoteData: FoldableValue2<typeof remoteData.URI> & MonadThrow2<typeof remoteData.URI> = {
  ...remoteData,
  foldValue: (fa, onNever, onValue) => (isSuccess(fa) ? onValue(fa.value) : onNever(fa)),
  throwError: failure
}

export const instanceLiveData: MonadThrow2<URIType> & CoproductLeft<URIType> & Filterable2<URIType> = {
  URI,
  ...getLiveDataM(instanceObservable, foldableValueRemoteData)
}

export const liveData = {
  ...instanceLiveData,
  ...pipeable(instanceLiveData),
  sequenceS: sequenceS(instanceLiveData),
  sequenceT: sequenceT(instanceLiveData),
  sequenceArray: array.sequence(instanceLiveData),
  combine: coproductMapLeft(instanceLiveData)
}

export type LiveDataInnerType<T> = T extends LiveData<unknown, infer K> ? K : never
