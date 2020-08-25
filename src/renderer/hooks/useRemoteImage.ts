import { useEffect, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'

export const useRemoteImage = (src: string) => {
  const [remoteImage, setRemoteImage] = useState<RD.RemoteData<string, string>>(RD.pending)

  useEffect(() => {
    const onLoadHandler = () => setRemoteImage(RD.success(src))
    const onErrorHandler = () => setRemoteImage(RD.failure(src))

    const image = new Image()
    image.addEventListener('load', onLoadHandler)
    image.addEventListener('error', onErrorHandler)
    image.src = src
    // clean up
    return () => {
      image.removeEventListener('load', onLoadHandler)
      image.removeEventListener('error', onErrorHandler)
    }
  }, [src])

  return remoteImage
}
