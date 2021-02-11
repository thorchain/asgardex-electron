import React, { useEffect, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { delay } from '@xchainjs/xchain-util'
import { Grid, Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import QRCode from 'qrcode'
import * as ReactDom from 'react-dom'
import { useIntl } from 'react-intl'

import * as Styled from './qrCode.styles'

type Props = {
  text: O.Option<string>
  noDataError: string
  qrError: string
}
export const QrCode: React.FC<Props> = ({ text, noDataError, qrError }) => {
  const canvasContainer = useRef<HTMLDivElement>(null)
  const intl = useIntl()

  const [canvasRd, setCanvasRd] = useState<RD.RemoteData<string, HTMLCanvasElement>>(RD.initial)

  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  useEffect(() => {
    setCanvasRd(RD.pending)
    FP.pipe(
      text,
      O.fold(
        () => {
          setCanvasRd(RD.failure(noDataError))
        },
        async (address) => {
          // Delay to render everything
          await delay(500)
          QRCode.toCanvas(address, { errorCorrectionLevel: 'H', scale: 6 }, (err, canvas) => {
            if (err) {
              setCanvasRd(RD.failure(qrError))
            } else {
              setCanvasRd(RD.success(canvas))
            }
          })
        }
      )
    )
  }, [intl, text, setCanvasRd, noDataError, qrError])

  useEffect(() => {
    FP.pipe(
      canvasRd,
      RD.fold(
        () => {},
        () => {
          ReactDom.render(<Spin />, canvasContainer.current)
        },
        (e) => {
          ReactDom.render(<>{e}</>, canvasContainer.current)
        },
        (canvas) => {
          FP.pipe(
            O.fromNullable(canvasContainer.current?.firstChild),
            O.fold(
              () => canvasContainer.current?.appendChild(canvas),
              (firstChild) => canvasContainer.current?.replaceChild(canvas, firstChild)
            )
          )
        }
      )
    )
  }, [canvasRd])

  return <Styled.QRWrapper smallView={!isDesktopView} ref={canvasContainer} />
}
