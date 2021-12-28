/**
 * MonadObservable
 * Borrowed from @devexperts/utils
 * @see https://github.com/devexperts/dx-platform/blob/master/packages/utils/src/typeclasses/monad-observable/monad-observable.ts
 */

import { HKT, Kind, Kind2, Kind3, URIS, URIS2, URIS3 } from 'fp-ts/lib/HKT'
import { MonadTask, MonadTask1, MonadTask2, MonadTask2C, MonadTask3 } from 'fp-ts/lib/MonadTask'

export interface Subscription {
  readonly unsubscribe: () => void
}

export interface Observer<A> {
  readonly next: (a: A) => void
  readonly end: () => void
}

export interface Observable<A> {
  readonly subscribe: (observer: Observer<A>) => Subscription
}

export interface FromEvent<M> {
  <K extends keyof WindowEventHandlersEventMap>(target: WindowEventHandlers, event: K): HKT<
    M,
    WindowEventHandlersEventMap[K]
  >
  (target: EventTarget, event: string): HKT<M, Event>
}

export interface FromEvent1<M extends URIS> {
  <K extends keyof WindowEventHandlersEventMap>(target: WindowEventHandlers, event: K): Kind<
    M,
    WindowEventHandlersEventMap[K]
  >
  (target: EventTarget, event: string): Kind<M, Event>
}

export interface FromEvent2<M extends URIS2> {
  <E, K extends keyof WindowEventHandlersEventMap>(target: WindowEventHandlers, event: K): Kind2<
    M,
    E,
    WindowEventHandlersEventMap[K]
  >
  <E>(target: EventTarget, event: string): Kind2<M, E, Event>
}

export interface FromEvent2C<M extends URIS2, E> {
  <K extends keyof WindowEventHandlersEventMap>(target: WindowEventHandlers, event: K): Kind2<
    M,
    E,
    WindowEventHandlersEventMap[K]
  >
  (target: EventTarget, event: string): Kind2<M, E, Event>
}

export interface FromEvent3<M extends URIS3> {
  <R, E, K extends keyof WindowEventHandlersEventMap>(target: WindowEventHandlers, event: K): Kind3<
    M,
    R,
    E,
    WindowEventHandlersEventMap[K]
  >
  <R, E>(target: EventTarget, event: string): Kind3<M, R, E, Event>
}

export type Adapter<F, A> = [(a: A) => void, HKT<F, A>]
export type Adapter1<F extends URIS, A> = [(a: A) => void, Kind<F, A>]
export type Adapter2<F extends URIS2, E, A> = [(a: A) => void, Kind2<F, E, A>]
export type Adapter3<F extends URIS3, R, E, A> = [(a: A) => void, Kind3<F, R, E, A>]

export interface MonadObservable<M> extends MonadTask<M> {
  readonly fromEvent: FromEvent<M>
  readonly fromObservable: <A>(observable: Observable<A>) => HKT<M, A>
  readonly createAdapter: <A>() => Adapter<M, A>
  readonly subscribe: <A>(fa: HKT<M, A>, observer: Observer<A>) => Subscription
}

export interface MonadObservable1<M extends URIS> extends MonadTask1<M> {
  readonly fromEvent: FromEvent1<M>
  readonly fromObservable: <A>(observable: Observable<A>) => Kind<M, A>
  readonly createAdapter: <A>() => Adapter1<M, A>
  readonly subscribe: <A>(fa: Kind<M, A>, observer: Observer<A>) => Subscription
}

export interface MonadObservable2<M extends URIS2> extends MonadTask2<M> {
  readonly fromEvent: FromEvent2<M>
  readonly fromObservable: <E, A>(observable: Observable<A>) => Kind2<M, E, A>
  readonly createAdapter: <E, A>() => Adapter2<M, E, A>
  readonly subscribe: <E, A>(fa: Kind2<M, E, A>, observer: Observer<A>) => Subscription
}

export interface MonadObservable2C<M extends URIS2, E> extends MonadTask2C<M, E> {
  readonly fromEvent: FromEvent2C<M, E>
  readonly fromObservable: <A>(observable: Observable<A>) => Kind2<M, E, A>
  readonly createAdapter: <A>() => Adapter2<M, E, A>
  readonly subscribe: <A>(fa: Kind2<M, E, A>, observer: Observer<A>) => Subscription
}

export interface MonadObservable3<M extends URIS3> extends MonadTask3<M> {
  readonly fromEvent: FromEvent3<M>
  readonly fromObservable: <R, E, A>(observable: Observable<A>) => Kind3<M, R, E, A>
  readonly createAdapter: <R, E, A>() => Adapter3<M, R, E, A>
  readonly subscribe: <R, E, A>(fa: Kind3<M, R, E, A>, observer: Observer<A>) => Subscription
}
