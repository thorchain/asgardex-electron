import React from 'react'

import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { chainToString } from '../../../../shared/utils/chain'
import { QRCode } from '../qrCode/QRCode'
import * as Styled from './QRCodeModal.styles'

export type Props = {
  asset: Asset
  address: string
  network: Network
  visible?: boolean
  onCancel?: FP.Lazy<void>
  onOk?: FP.Lazy<void>
}

export const QRCodeModal: React.FC<Props> = (props): JSX.Element => {
  const { asset, address, network, onOk = FP.constVoid, onCancel = FP.constVoid, visible = false } = props

  const intl = useIntl()

  return (
    <Styled.QRCodeModal
      key="qr-code-modal"
      title={intl.formatMessage(
        { id: 'wallet.action.receive.title' },
        { asset: `${asset.ticker} (${chainToString(asset.chain)})` }
      )}
      visible={visible}
      onCancel={onCancel}
      onOk={() => onOk()}>
      <QRCode text={address} qrError={intl.formatMessage({ id: 'wallet.receive.address.errorQR' })} />
      <Styled.AddressContainer key={'address info'}>
        <Styled.AddressEllipsis enableCopy network={network} chain={asset.chain} address={address} />
      </Styled.AddressContainer>
    </Styled.QRCodeModal>
  )
}
