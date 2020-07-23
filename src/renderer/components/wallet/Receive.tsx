import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { delay, Asset, assetToString } from '@thorchain/asgardex-util'
import { Grid, Row, Col } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import QRCode from 'qrcode'
import { useIntl } from 'react-intl'

import AssetIcon from '../uielements/assets/assetIcon'
import BackLink from '../uielements/backLink'
import * as Styled from './Receive.style'

type Props = {
  address: O.Option<Address>
  asset: O.Option<Asset>
}

const Receive: React.FC<Props> = (props: Props): JSX.Element => {
  const { address: oAddress, asset: oAsset } = props

  const [copyMsg, setCopyMsg] = useState<string>('')
  const [errMsg, setErrorMsg] = useState<string>('')
  const intl = useIntl()
  const canvasContainer = useRef<HTMLDivElement>(null)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const asset = O.toNullable(oAsset)

  useEffect(() => {
    setErrorMsg('')
    FP.pipe(
      oAddress,
      O.fold(
        () => setErrorMsg(intl.formatMessage({ id: 'wallet.receive.address.error' })),
        (address) => {
          QRCode.toCanvas(address, { errorCorrectionLevel: 'H', scale: 6 }, (err, canvas) => {
            if (err) {
              setErrorMsg(intl.formatMessage({ id: 'wallet.receive.address.errorQR' }, { error: err.toString() }))
            } else {
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
        navigator.clipboard.writeText(address)
        setCopyMsg(intl.formatMessage({ id: 'wallet.receive.address.copied' }))
        await delay(3000)
        setCopyMsg('')

        return address
      })
    )
  }, [intl, oAddress])

  const addressLabel = FP.pipe(
    oAddress,
    O.getOrElse(() => '')
  )

  const renderAssetIcon = useMemo(() => asset && <AssetIcon asset={asset} size="large" />, [asset])

  return (
    <>
      <Row>
        <Col span={24}>
          <BackLink />
        </Col>
      </Row>
      <Row>
        <Styled.Col span={24}>
          <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
            {renderAssetIcon}
            <Styled.CoinInfoWrapper>
              <Styled.CoinTitle>{asset?.ticker ?? '--'}</Styled.CoinTitle>
              <Styled.CoinSubtitle>{asset ? assetToString(asset) : '--'}</Styled.CoinSubtitle>
            </Styled.CoinInfoWrapper>
          </Styled.Card>
          <Styled.Card bordered={false}>
            <Styled.QRWrapper isDesktopView={isDesktopView} ref={canvasContainer}>
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
              <>
                <Styled.Label size="big" onClick={handleCopyAddress}>
                  {intl.formatMessage({ id: 'common.copy' })}
                </Styled.Label>
                <Styled.Address size="big">{copyMsg}</Styled.Address>
              </>
            )}
          </Styled.Div>
        </Styled.Col>
      </Row>
    </>
  )
}

export default Receive
