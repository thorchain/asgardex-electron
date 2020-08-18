import { Observable } from 'rxjs';
import { remoteData, RemoteData, failure, isSuccess } from '@devexperts/remote-data-ts';
import { MonadThrow2 } from 'fp-ts/lib/MonadThrow';
import {
  CoproductLeft,
  coproductMapLeft,
} from '@devexperts/utils/dist/typeclasses/product-left-coproduct-left/product-left-coproduct-left.utils';
import { pipeable } from 'fp-ts/lib/pipeable';
import { sequenceT } from 'fp-ts/lib/Apply';
import { array } from 'fp-ts/lib/Array';
import { Filterable2 } from 'fp-ts/lib/Filterable';
import { getLiveDataM } from '@devexperts/utils/dist/adt/live-data.utils';
import { FoldableValue2 } from '@devexperts/utils/dist/typeclasses/foldable-value/foldable-value';
import { instanceObservable } from '@devexperts/rx-utils/dist/observable.utils';

/**
 * isomoprhic to `LiveData12<typeof instanceObservable.URI, typeof remoteData.URI, E, A>`
 * but left as an interface to not overload typechecker and IDE
 */
export interface LiveData<E, A> extends Observable<RemoteData<E, A>> {}

export const URI = '@devexperts/rx-utils//LiveData';
export type URI = typeof URI;
declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    [URI]: LiveData<E, A>;
  }
}

const foldableValueRemoteData: FoldableValue2<typeof remoteData.URI> & MonadThrow2<typeof remoteData.URI> = {
  ...remoteData,
  foldValue: (fa, onNever, onValue) => (isSuccess(fa) ? onValue(fa.value) : onNever(fa)),
  throwError: failure,
};

export const instanceLiveData: MonadThrow2<URI> & CoproductLeft<URI> & Filterable2<URI> = {
  URI,
  ...getLiveDataM(instanceObservable, foldableValueRemoteData),
};

export const liveData = {
  ...instanceLiveData,
  ...pipeable(instanceLiveData),
  sequenceT: sequenceT(instanceLiveData),
  sequenceArray: array.sequence(instanceLiveData),
  combine: coproductMapLeft(instanceLiveData),
};

export type LiveDataInnerType<T> = T extends LiveData<any, infer K> ? K : never;
