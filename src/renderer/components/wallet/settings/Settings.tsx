import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { Row, Col, List } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { getChainAsset } from '../../../helpers/chainHelper'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { UserAccountType } from '../../../types/wallet'
import { RemoveWalletConfirmationModal } from '../../modal/confirmation/RemoveWalletConfirmationModal'
import { PasswordModal } from '../../modal/password'
import { QRCodeModal } from '../../uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../phrase'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  userAccounts?: O.Option<UserAccountType[]>
  runeNativeAddress: string
  lockWallet?: () => void
  removeKeystore?: () => void
  exportKeystore?: (runeNativeAddress: string, selectedNetwork: Network) => void
  phrase?: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
  ClientSettingsView: React.ComponentType<{}>
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const {
    selectedNetwork,
    userAccounts = O.none,
    runeNativeAddress = '',
    lockWallet = () => {},
    removeKeystore = () => {},
    exportKeystore = () => {},
    /* Hide `addDevice` for all chains temporarily
    retrieveLedgerAddress,
    */
    /* Hide `removeDevice` for all chains temporarily
    removeLedgerAddress,
    */
    phrase: oPhrase = O.none,
    clickAddressLinkHandler,
    validatePassword$,
    ClientSettingsView
  } = props

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

  const renderAddress = useCallback(
    (chain: Chain, address: Address) => (
      <Styled.AddressContainer>
        <Styled.AddressEllipsis address={address} chain={chain} network={selectedNetwork} enableCopy={true} />
        <Styled.QRCodeIcon onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))} />
        <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />
      </Styled.AddressContainer>
    ),
    [clickAddressLinkHandler, selectedNetwork]
  )

  const accounts = useMemo(
    () =>
      FP.pipe(
        userAccounts,
        O.map((accounts) => (
          <Col key={'accounts'} sm={{ span: 24 }} lg={{ span: 12 }}>
            <Styled.Subtitle>{intl.formatMessage({ id: 'setting.account.management' })}</Styled.Subtitle>
            <Styled.AccountCard>
              <List
                dataSource={accounts}
                renderItem={(item, i: number) => (
                  <Styled.ListItem key={i}>
                    <Styled.ChainName>{item.chainName}</Styled.ChainName>
                    {item.accounts.map((acc, j) => (
                      <Styled.ChainContent key={j}>
                        <Styled.AccountPlaceholder>{acc.name}</Styled.AccountPlaceholder>
                        {renderAddress(item.chainName, acc.address)}
                      </Styled.ChainContent>
                    ))}
                  </Styled.ListItem>
                )}
              />
            </Styled.AccountCard>
          </Col>
        )),
        O.getOrElse(() => <></>)
      ),
    [renderAddress, intl, userAccounts]
  )

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
                    {intl.formatMessage({ id: 'setting.lock' })} <UnlockOutlined />
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
          <Styled.Subtitle>{intl.formatMessage({ id: 'setting.client' })}</Styled.Subtitle>
          <Styled.Card>
            <Row>
              <Col span={24}>
                <ClientSettingsView />
              </Col>
            </Row>
          </Styled.Card>
        </Col>
        {accounts}
      </Styled.Row>
    </>
  )
}
