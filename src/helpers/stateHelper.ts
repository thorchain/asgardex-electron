import { Observable, BehaviorSubject } from 'rxjs'

type ObservableState<T> = {
  get$: Observable<T>
  get: () => T
  set: (value: T) => void
}

/**
 * Factory to create an Observable State
 *
 * It returns an object with following properties:
 *
 * `get$` - A getter as an Observable - to subscribe to any changes if needed
 * `get` - A getter of current value
 * `set` - A setter to update values
 *
 * Example:
 *
 * const { get$, get, set} = observableState(0)
 * // subscribe to any updates
 * get$.subscribe({next: (value) => console.log('next value' , value)})
 * // get current value
 * const current = get()
 * console.log(current) // 0
 * set(1)
 * console.log(current) // 1
 * // Now "next value 1" will be printed by previous subscription, too
 *
 */
export const observableState = <T>(initial: T): ObservableState<T> => {
  const subject$$ = new BehaviorSubject(initial)
  return {
    get$: subject$$.asObservable(),
    get: () => subject$$.getValue(),
    set: (newValue: T) => subject$$.next(newValue)
  }
}
