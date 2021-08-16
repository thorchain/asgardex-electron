import React, { useCallback, useMemo, useState } from 'react'

import { Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { RemoveWalletConfirmationModal } from '../../components/modal/confirmation/RemoveWalletConfirmationModal'
import { PasswordModal } from '../../components/modal/password'
import { PhraseCopyModal } from '../../components/wallet/phrase/PhraseCopyModal'
import * as Styled from '../../components/wallet/settings/Settings.style'
import { ValidatePasswordHandler } from '../../services/wallet/types'

type Props = {
  selectedNetwork: Network
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  phrase: O.Option<string>
  validatePassword$: ValidatePasswordHandler
}

export const WalletSettingsView: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const {
    selectedNetwork,
    runeNativeAddress = '',
    lockWallet = () => {},
    removeKeystore = () => {},
    exportKeystore = () => {},
    phrase: oPhrase,
    validatePassword$
  } = props

  const phrase = useMemo(
    () =>
      FP.pipe(
        oPhrase,
        O.map((phrase) => phrase),
        O.getOrElse(() => '')
      ),
    [oPhrase]
  )

  const [showPhraseModal, setShowPhraseModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showRemoveWalletModal, setShowRemoveWalletModal] = useState(false)

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

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
      <Styled.Subtitle>{intl.formatMessage({ id: 'setting.wallet.management' })}</Styled.Subtitle>
      <Styled.Card>
        <Row>
          <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.OptionCard bordered={false}>
              <Styled.OptionLabel
                color="primary"
                size="big"
                onClick={() => exportKeystore(runeNativeAddress, selectedNetwork)}>
                {intl.formatMessage({ id: 'setting.export' })}
              </Styled.OptionLabel>
            </Styled.OptionCard>
          </Styled.WalletCol>
          <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.OptionCard bordered={false}>
              <Styled.OptionLabel color="warning" size="big" onClick={lockWallet}>
                {intl.formatMessage({ id: 'setting.lock' })}
              </Styled.OptionLabel>
            </Styled.OptionCard>
          </Styled.WalletCol>
          <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.OptionCard bordered={false}>
              <Styled.Button
                sizevalue="xnormal"
                color="primary"
                typevalue="outline"
                round="true"
                onClick={() => setShowPasswordModal(true)}
                disabled={O.isNone(oPhrase) ? true : false}>
                {intl.formatMessage({ id: 'setting.view.phrase' })}
              </Styled.Button>
            </Styled.OptionCard>
          </Styled.WalletCol>
          <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
            <Styled.OptionCard bordered={false}>
              <Styled.Button
                sizevalue="xnormal"
                color="error"
                typevalue="outline"
                round="true"
                onClick={() => setShowRemoveWalletModal(true)}>
                {intl.formatMessage({ id: 'wallet.remove.label' })}
              </Styled.Button>
            </Styled.OptionCard>
          </Styled.WalletCol>
        </Row>
      </Styled.Card>
    </>
  )
}
