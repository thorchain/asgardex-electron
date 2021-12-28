/** asdf
 *
 * Borrowed from @devexperts/utils
 *
 * @see https://github.com/devexperts/dx-platform/blob/master/packages/rx-utils/src/observable.utils.ts
 */

import { observable as rxjs, URI } from 'fp-ts-rxjs/lib/Observable'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'
import { task } from 'fp-ts/lib/Task'
import { Observable, Subject } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { share, shareReplay, switchMap } from 'rxjs/operators'

import { MonadObservable1 } from './monad-observable'

export const instanceObservable: typeof rxjs & MonadObservable1<URI> = {
  ...rxjs,
  chain: (fa, f) => pipe(fa, switchMap(f)),
  createAdapter: <A>() => {
    const s = new Subject<A>()
    const next = (a: A) => s.next(a)
    return [next, s.asObservable()]
  },
  fromEvent: (target: WindowEventHandlers | EventTarget, event: string) =>
    pipe(
      new Observable<Event>((subscriber) => {
        const handler = (e: Event) => subscriber.next(e)
        target.addEventListener(event, handler)
        return () => target.removeEventListener(event, handler)
      }),
      share()
    ),
  fromObservable: (observable) =>
    new Observable((subscriber) =>
      observable.subscribe({
        end() {
          subscriber.complete()
        },
        next(e) {
          subscriber.next(e)
        }
      })
    ),
  fromTask: (fa) => fromPromise(fa()),
  fromIO: (fa) => fromPromise(task.fromIO(fa)()),
  subscribe: (fa, observer) =>
    fa.subscribe({
      next(e) {
        observer.next(e)
      },
      complete() {
        observer.end()
      }
    })
}

const zero: () => Observable<never> = instanceObservable.zero
const hold: <A>(source: Observable<A>) => Observable<A> = shareReplay({ refCount: true, bufferSize: 1 })
export const observable = {
  ...instanceObservable,
  ...pipeable(instanceObservable),
  zero,
  hold
}
