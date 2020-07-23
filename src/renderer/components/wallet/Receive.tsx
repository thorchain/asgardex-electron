import React, { useCallback, useEffect, useState, useRef } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { delay } from '@thorchain/asgardex-util'
import { Grid, Row, Col } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import QRCode from 'qrcode'
import { useIntl } from 'react-intl'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import BackLink from '../uielements/backLink'
import AccountSelector from './AccountSelector'
import * as Styled from './Receive.style'

type Props = {
  address: O.Option<Address>
}

const Receive: React.FC<Props> = (props: Props): JSX.Element => {
  const { address: oAddress } = props

  const [copyMsg, setCopyMsg] = useState<string>('')
  const [errMsg, setErrorMsg] = useState<string>('')
  const intl = useIntl()
  const canvasContainer = useRef<HTMLDivElement>(null)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

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

  return (
    <>
      <Row>
        <Col span={24}>
          <BackLink />
        </Col>
      </Row>
      <Row>
        <Styled.Col span={24}>
          <AccountSelector asset={ASSETS_MAINNET.BOLT} assets={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO]} />
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
