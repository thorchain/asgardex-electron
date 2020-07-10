import { useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'

export const useRemoteImage = (src: string) => {
  const [remoteImage, setRemoteImage] = useState<RD.RemoteData<string, string>>(RD.pending)

  const image = new Image()

  image.onload = () => setRemoteImage(RD.success(src))
  image.onerror = () => setRemoteImage(RD.failure(src))
  image.src = src

  return remoteImage
}
