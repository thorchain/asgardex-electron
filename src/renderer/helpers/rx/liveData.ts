import * as RD from '@devexperts/remote-data-ts'
import { getLiveDataM } from '@devexperts/utils/dist/adt/live-data.utils'
import { FoldableValue2 } from '@devexperts/utils/dist/typeclasses/foldable-value/foldable-value'
import {
  CoproductLeft,
  coproductMapLeft
} from '@devexperts/utils/dist/typeclasses/product-left-coproduct-left/product-left-coproduct-left.utils'
import { sequenceS, sequenceT } from 'fp-ts/lib/Apply'
import * as A from 'fp-ts/lib/Array'
import { Filterable2 } from 'fp-ts/lib/Filterable'
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow'
import { pipeable } from 'fp-ts/lib/pipeable'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { instanceObservable } from './observable-utils'

export type LiveData<E, A> = Rx.Observable<RD.RemoteData<E, A>>

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
  sequenceArray: A.sequence(instanceLiveData),
  combine: coproductMapLeft(instanceLiveData),
  mapLeft:
    <L, V, A>(f: (l: L) => V) =>
    (fla: LiveData<L, A>): LiveData<V, A> =>
      fla.pipe(RxOp.map(RD.mapLeft(f))),
  /**
   * LiveData<L,A> => Observable<Option<A>>
   */
  toOption$: <L, A>(fla: LiveData<L, A>): Rx.Observable<O.Option<A>> => fla.pipe(RxOp.map(RD.toOption)),
  /**
   *  1. Maps inner value of LiveData<L, A> with fab => LiveData<L, B>
   *  2. LiveData<L,A> => Observable<Option<A>>
   *
   */
  toOptionMap$:
    <L, A, B>(fab: (fa: A) => B) =>
    (fla: LiveData<L, A>): Rx.Observable<O.Option<B>> =>
      fla.pipe(RxOp.map(RD.map(fab)), RxOp.map(RD.toOption)),
  altOnError:
    <L, A>(f: (l: L) => A) =>
    (fla: LiveData<L, A>): LiveData<L, A> =>
      fla.pipe(
        RxOp.map(
          RD.fold(
            () => RD.initial,
            () => RD.pending,
            (e) => RD.success(f(e)),
            (val) => RD.success(val)
          )
        )
      ),
  chainOnError:
    <L, A>(f: (l: L) => LiveData<L, A>) =>
    (fla: LiveData<L, A>) =>
      fla.pipe(
        RxOp.switchMap(
          RD.fold(
            () => Rx.of(RD.initial),
            () => Rx.of(RD.pending),
            f,
            (val) => Rx.of(RD.success(val))
          )
        )
      )
}

export type LiveDataInnerType<T> = T extends LiveData<unknown, infer K> ? K : never
