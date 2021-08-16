import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { Row, Col } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { RemoveWalletConfirmationModal } from '../../modal/confirmation/RemoveWalletConfirmationModal'
import { PasswordModal } from '../../modal/password'
import { QRCodeModal } from '../../uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../phrase'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  phrase: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
  ClientSettingsView: React.ComponentType<{}>
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const { selectedNetwork, removeKeystore = () => {}, phrase: oPhrase, validatePassword$, ClientSettingsView } = props

  const [showPhraseModal, setShowPhraseModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showRemoveWalletModal, setShowRemoveWalletModal] = useState(false)

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

  const phrase = useMemo(
    () =>
      FP.pipe(
        oPhrase,
        O.map((phrase) => phrase),
        O.getOrElse(() => '')
      ),
    [oPhrase]
  )

  const [showQRModal, setShowQRModal] = useState<O.Option<{ asset: Asset; address: Address }>>(O.none)

  const closeQrModal = useCallback(() => setShowQRModal(O.none), [setShowQRModal])

  const renderQRCodeModal = useMemo(() => {
    return FP.pipe(
      showQRModal,
      O.map(({ asset, address }) => (
        <QRCodeModal
          key="qr-modal"
          asset={asset}
          address={address}
          network={selectedNetwork}
          visible={true}
          onCancel={closeQrModal}
          onOk={closeQrModal}
        />
      )),
      O.getOrElse(() => <></>)
    )
  }, [showQRModal, selectedNetwork, closeQrModal])

  const onSuccessPassword = useCallback(() => {
    setShowPasswordModal(false)
    setShowPhraseModal(true)
  }, [setShowPasswordModal, setShowPhraseModal])

  return (
    <>
      {showPasswordModal && (
        <PasswordModal
          validatePassword$={validatePassword$}
          onSuccess={onSuccessPassword}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      {showPhraseModal && (
        <PhraseCopyModal
          phrase={phrase}
          visible={showPhraseModal}
          onClose={() => {
            setShowPhraseModal(false)
          }}
        />
      )}
      <RemoveWalletConfirmationModal
        visible={showRemoveWalletModal}
        onClose={() => setShowRemoveWalletModal(false)}
        onSuccess={removeWallet}
      />
      {renderQRCodeModal}
      <Row>
        <Col span={24}>
          <Styled.TitleWrapper>
            <Styled.Title>{intl.formatMessage({ id: 'setting.title' })}</Styled.Title>
          </Styled.TitleWrapper>
          <Styled.Divider />
        </Col>
      </Row>
      <Styled.Row gutter={[16, 16]}>
        <Col sm={{ span: 24 }} lg={{ span: 12 }}>
          <Styled.Subtitle>{intl.formatMessage({ id: 'setting.client' })}</Styled.Subtitle>
          <Styled.Card>
            <Row>
              <Col span={24}>
                <ClientSettingsView />
              </Col>
            </Row>
          </Styled.Card>
        </Col>
      </Styled.Row>
    </>
  )
}
