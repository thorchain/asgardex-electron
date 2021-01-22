import React, { useEffect, useState, useRef, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-binance'
import { delay, Asset } from '@xchainjs/xchain-util'
import { Grid, Row, Col, Spin } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import QRCode from 'qrcode'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { truncateAddress } from '../../../../helpers/addressHelper'
import { AssetInfo } from '../../../uielements/assets/assetInfo'
import { BackLink } from '../../../uielements/backLink'
import * as Styled from './Receive.style'

type Props = {
  address: O.Option<Address>
  asset: O.Option<Asset>
  network: Network
}

export const Receive: React.FC<Props> = (props): JSX.Element => {
  const { address: oAddress, asset: oAsset, network } = props

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

  const addressLabel = useMemo(
    () =>
      FP.pipe(
        oAddress,
        O.getOrElse(() => '')
      ),
    [oAddress]
  )

  const hasAddress = O.isSome(oAddress)

  const renderAddress = useMemo(() => {
    return FP.pipe(
      oAsset,
      O.fold(
        () => addressLabel,
        (asset) => truncateAddress(addressLabel, asset.chain, network)
      )
    )
  }, [addressLabel, network, oAsset])

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
              {hasAddress && !hasQR && <Spin />}
              {errMsg}
            </Styled.QRWrapper>
          </Styled.Card>
          <Styled.Div>
            <label htmlFor="clipboard-btn">
              <Styled.Address size="large">{isDesktopView ? addressLabel : renderAddress}</Styled.Address>
            </label>
            {hasAddress && (
              <Styled.CopyLabel copyable={{ text: addressLabel }}>
                {intl.formatMessage({ id: 'common.copy' })}
              </Styled.CopyLabel>
            )}
          </Styled.Div>
        </Styled.Col>
      </Row>
    </>
  )
}
