import { useEffect, useRef, RefObject } from 'react'

type Callback = (e: MouseEvent) => void

export function useClickOutside<T extends Element>(
  ref: RefObject<T>,
  callback: Callback,
  options?: boolean | AddEventListenerOptions
) {
  const callbackRef = useRef<Callback>()
  callbackRef.current = callback

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!ref?.current?.contains(e.target as Element) && callbackRef.current) {
        callbackRef?.current(e)
      }
    }
    window.addEventListener('click', clickHandler, options)
    return () => window.removeEventListener('click', clickHandler, options)
  }, [ref, callbackRef, options])
}
