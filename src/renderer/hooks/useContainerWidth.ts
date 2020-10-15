import { RefObject, useEffect, useMemo, useState } from 'react'

import { useSubscription } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

/**
 * Hook to get a width of an element while resizing the window
 **/
export const useElementWidth = <T extends Element>(ref: RefObject<T>): number => {
  const [width, setWidth] = useState(0)

  // set width whenever ref has been changed
  // needed to get width if `ref.current` is not `null`
  // `wdith$` cant do this for us for any reason ...
  useEffect(() => setWidth(ref.current?.clientWidth ?? 0), [ref])

  const width$ = useMemo(
    () =>
      Rx.fromEvent(window, 'resize').pipe(
        // debounce for performance reason
        RxOp.debounceTime(50),
        RxOp.map(() => ref.current?.clientWidth ?? 0)
      ),
    [ref]
  )

  useSubscription(width$, setWidth)

  return width
}
