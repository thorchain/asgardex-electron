import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { Row, Col, List } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { getChainAsset } from '../../../helpers/chainHelper'
import { ValidatePasswordHandler, WalletAccounts, WalletAddress } from '../../../services/wallet/types'
import { walletTypeToI18n } from '../../../services/wallet/util'
import { RemoveWalletConfirmationModal } from '../../modal/confirmation/RemoveWalletConfirmationModal'
import { PasswordModal } from '../../modal/password'
import { QRCodeModal } from '../../uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../phrase'
import * as Styled from './Settings.style'

type Props = {
  selectedNetwork: Network
  walletAccounts: O.Option<WalletAccounts>
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  removeLedgerAddress: (chain: Chain) => void
  addLedgerAddress: (chain: Chain) => void
  phrase: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
  ClientSettingsView: React.ComponentType<{}>
}

export const Settings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const {
    selectedNetwork,
    walletAccounts: oWalletAccounts,
    runeNativeAddress = '',
    lockWallet = () => {},
    removeKeystore = () => {},
    exportKeystore = () => {},
    removeLedgerAddress,
    addLedgerAddress,
    phrase: oPhrase,
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
    (chain: Chain, { type, address: addressRD }: WalletAddress) => {
      // Render ADD LEDGER button
      const renderAddLedger = (chain: Chain, loading: boolean) => (
        <Styled.AddLedgerButton loading={loading} onClick={() => addLedgerAddress(chain)}>
          <Styled.AddLedgerIcon /> {intl.formatMessage({ id: 'ledger.add.device' })}
        </Styled.AddLedgerButton>
      )

      // Render addresses depending on its loading status
      return (
        <Styled.AddressContainer>
          {FP.pipe(
            addressRD,
            RD.fold(
              () => (type === 'ledger' ? renderAddLedger(chain, false) : <>...</>),
              () => (type === 'ledger' ? renderAddLedger(chain, true) : <>...</>),
              (error) => (
                <div>
                  <Styled.AddressError>{error.message}</Styled.AddressError>
                  {type === 'ledger' && renderAddLedger(chain, false)}
                </div>
              ),
              (address) => (
                <>
                  <Styled.AddressEllipsis address={address} chain={chain} network={selectedNetwork} enableCopy={true} />
                  <Styled.QRCodeIcon onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))} />
                  <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />
                  {type === 'ledger' && <Styled.RemoveLedgerIcon onClick={() => removeLedgerAddress(chain)} />}
                </>
              )
            )
          )}
        </Styled.AddressContainer>
      )
    },
    [addLedgerAddress, clickAddressLinkHandler, intl, removeLedgerAddress, selectedNetwork]
  )

  const accounts = useMemo(
    () =>
      FP.pipe(
        oWalletAccounts,
        O.map((walletAccounts) => (
          <Col key={'accounts'} sm={{ span: 24 }} lg={{ span: 12 }}>
            <Styled.Subtitle>{intl.formatMessage({ id: 'setting.account.management' })}</Styled.Subtitle>
            <Styled.AccountCard>
              <List
                dataSource={walletAccounts}
                renderItem={({ chain, accounts }, i: number) => (
                  <Styled.ListItem key={i}>
                    <Styled.ChainName>{chain}</Styled.ChainName>
                    {accounts.map((account, j) => {
                      const { type } = account

                      return (
                        <Styled.ChainContent key={j}>
                          <Styled.AccountPlaceholder>{walletTypeToI18n(type, intl)}</Styled.AccountPlaceholder>
                          {renderAddress(chain, account)}
                        </Styled.ChainContent>
                      )
                    })}
                  </Styled.ListItem>
                )}
              />
            </Styled.AccountCard>
          </Col>
        )),
        O.getOrElse(() => <></>)
      ),
    [renderAddress, intl, oWalletAccounts]
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
