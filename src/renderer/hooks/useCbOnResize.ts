import { useEffect } from 'react'

type WindowResizeListener = (onResizeCb: () => void, callOnMount?: boolean) => void

export const useCbOnResize: WindowResizeListener = (onResizeCb, callOnMount = true) => {
  useEffect(() => {
    if (callOnMount) {
      onResizeCb()
    }
    window.addEventListener('resize', onResizeCb)

    return () => {
      window.removeEventListener('resize', onResizeCb)
    }
  }, [callOnMount, onResizeCb])
}
