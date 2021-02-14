import { useCallback, useEffect, useRef, useState } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'

export const useManualSubscription = <T extends {}>(data$: Rx.Observable<T>, initialValue: T) => {
  const [data, setDataState] = useState(initialValue)

  // (Possible) subscription
  const subRef = useRef<O.Option<Rx.Subscription>>(O.none)

  const unsubscribe = useCallback(() => {
    FP.pipe(
      subRef.current,
      O.map((sub) => {
        return sub.unsubscribe()
      })
    )
  }, [])

  useEffect(() => {
    // Unsubscribe of possible subscription in case source data$ stream changed
    unsubscribe()
    return () => {
      // Unsubscribe of possible subscription in case of unmount
      unsubscribe()
    }
  }, [data$, unsubscribe])

  const subscribe = useCallback(() => {
    // Unsubscribe of possible subscription in case of new subscription
    unsubscribe()
    subRef.current = O.some(data$.subscribe(setDataState))
  }, [data$, unsubscribe])

  const setData = useCallback(
    (value: T) => {
      // Unsubscribe of possible subscription in case of new subscription
      unsubscribe()
      /**
       * Replace saved subscription with a single emitted value to avoid
       * saving subscription in case of manual setting inner-state's data
       */
      subRef.current = O.some(Rx.of(value).subscribe(setDataState))
    },
    [unsubscribe]
  )

  return {
    data,
    subscribe,
    setData
  }
}
