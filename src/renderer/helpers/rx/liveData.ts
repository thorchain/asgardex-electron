import * as RD from '@devexperts/remote-data-ts'
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
import * as RxOp from 'rxjs/operators'

export type LiveData<E, A> = Observable<RD.RemoteData<E, A>>

export const URI = '//LiveData'
export type URIType = typeof URI
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    [URI]: LiveData<E, A>
  }
}

const foldableValueRemoteData: FoldableValue2<typeof RD.remoteData.URI> & MonadThrow2<typeof RD.remoteData.URI> = {
  ...RD.remoteData,
  foldValue: (fa, onNever, onValue) => (RD.isSuccess(fa) ? onValue(fa.value) : onNever(fa)),
  throwError: RD.failure
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
  combine: coproductMapLeft(instanceLiveData),
  mapLeft: <L, V, A>(f: (l: L) => V) => (fla: LiveData<L, A>): LiveData<V, A> => fla.pipe(RxOp.map(RD.mapLeft(f)))
}

export type LiveDataInnerType<T> = T extends LiveData<unknown, infer K> ? K : never
