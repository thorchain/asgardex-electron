import { useCallback, useEffect, useRef, useState } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

/**
 * Custom hook
 * to subscribe to an Observable
 * and to put its values into a state
 *
 * Why not just using `observableState of `observable-state`?
 * Just because `observableState` does ont work in `useCallback.
 *
 * In other cases, always use `observableState`
 */
export const useSubscriptionState = <T>(initialState: T) => {
  // State stream values
  const [state, setState] = useState<T>(initialState)

  // Ref. to subscription
  const subRef = useRef<O.Option<Rx.Subscription>>(O.none)

  // Unsubscribe subscription (if there any)
  const unsubscribeSub = useCallback(() => {
    FP.pipe(
      subRef.current,
      O.map((sub) => sub.unsubscribe())
    )
    subRef.current = O.none
  }, [subRef])

  // Store subscription by unsubscribing previous subscription
  const setSub = useCallback(
    (subscription) => {
      unsubscribeSub()
      subRef.current = O.some(subscription)
    },
    [unsubscribeSub]
  )

  // Reset subscription and state
  const reset = useCallback(() => {
    unsubscribeSub()
    setState(initialState)
  }, [unsubscribeSub, initialState])

  // Subscribe to an Observable
  const subscribe = (stream$: Rx.Observable<T>) => {
    const subscription = stream$.subscribe(setState)
    setSub(subscription)
  }

  /** Clean up */
  useEffect(() => {
    return () => {
      unsubscribeSub()
    }
  }, [unsubscribeSub])

  return { state, setState, subscribe, reset }
}
