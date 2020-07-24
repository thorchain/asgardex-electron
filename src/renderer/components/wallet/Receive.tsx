import React, { useCallback, useEffect, useState, useRef } from 'react'

import { CheckCircleOutlined } from '@ant-design/icons'
import { Address } from '@thorchain/asgardex-binance'
import { delay, Asset } from '@thorchain/asgardex-util'
import { Grid, Row, Col, Spin } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import QRCode from 'qrcode'
import { useIntl } from 'react-intl'

import AssetInfo from '../uielements/assets/AssetInfo'
import BackLink from '../uielements/backLink'
import * as Styled from './Receive.style'

type Props = {
  address: O.Option<Address>
  asset: O.Option<Asset>
}

const Receive: React.FC<Props> = (props: Props): JSX.Element => {
  const { address: oAddress, asset: oAsset } = props

  const [copying, setCopying] = useState(false)
  const [errMsg, setErrorMsg] = useState('')
  const [hasQR, setHasQR] = useState(false)
  const intl = useIntl()
  const canvasContainer = useRef<HTMLDivElement>(null)
  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  useEffect(() => {
    setErrorMsg('')
    setHasQR(false)
    FP.pipe(
      oAddress,
      O.fold(
        () => setErrorMsg(intl.formatMessage({ id: 'wallet.receive.address.error' })),
        async (address) => {
          // Delay to render everything
          await delay(500)
          QRCode.toCanvas(address, { errorCorrectionLevel: 'H', scale: 6 }, (err, canvas) => {
            if (err) {
              setErrorMsg(intl.formatMessage({ id: 'wallet.receive.address.errorQR' }, { error: err.toString() }))
            } else {
              setHasQR(true)
              canvasContainer.current?.appendChild(canvas)
            }
          })
        }
      )
    )
  }, [intl, oAddress])

  const handleCopyAddress = useCallback(async () => {
    FP.pipe(
      oAddress,
      O.map(async (address) => {
        setCopying(true)
        navigator.clipboard.writeText(address)
        await delay(2000)
        setCopying(false)
        return address
      })
    )
  }, [oAddress])

  const addressLabel = FP.pipe(
    oAddress,
    O.getOrElse(() => '')
  )

  return (
    <>
      <Row>
        <Col span={24}>
          <BackLink />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <AssetInfo asset={oAsset} />
        </Col>
        <Styled.Col span={24}>
          <Styled.Card bordered={false}>
            <Styled.QRWrapper smallView={!isDesktopView} ref={canvasContainer}>
              {!hasQR && O.isSome(oAddress) && <Spin />}
              {errMsg}
            </Styled.QRWrapper>
          </Styled.Card>
          <Styled.Div>
            {isDesktopView ? (
              <label htmlFor="clipboard-btn">
                <Styled.Address size="large">{addressLabel}</Styled.Address>
              </label>
            ) : (
              <Styled.AddressWrapper htmlFor="clipboard-btn">
                <Styled.Address size="large">{addressLabel}</Styled.Address>
              </Styled.AddressWrapper>
            )}
            {O.isSome(oAddress) && (
              <Styled.CopyLabel size="big" onClick={handleCopyAddress}>
                {intl.formatMessage({ id: 'common.copy' })}
                <CheckCircleOutlined style={{ visibility: copying ? 'visible' : 'hidden' }} />
              </Styled.CopyLabel>
            )}
          </Styled.Div>
        </Styled.Col>
      </Row>
    </>
  )
}

export default Receive
