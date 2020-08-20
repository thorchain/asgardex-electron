import * as Rx from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { observableState } from '../stateHelper'

export const fromPromise$ = <T, V>(
  factory: (next: V) => Promise<T>,
  defaultValue: T,
  onError: (_: Error) => T = (_) => defaultValue
) => {
  const { get$, set } = observableState<T>(defaultValue)

  const res$ = get$.pipe(
    switchMap((val) => {
      return Rx.of(val)
    })
  ) as Rx.Observable<T>

  return (next: V) => {
    factory(next).catch(onError).then(set)
    return res$
  }
}
