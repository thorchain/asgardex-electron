import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util'
import { Col, List, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { isLedgerWallet } from '../../../../shared/utils/guard'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { RemoveWalletConfirmationModal } from '../../../components/modal/confirmation/RemoveWalletConfirmationModal'
import { PasswordModal } from '../../../components/modal/password'
import { AssetIcon } from '../../../components/uielements/assets/assetIcon/AssetIcon'
import { QRCodeModal } from '../../../components/uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../../../components/wallet/phrase/PhraseCopyModal'
import { getChainAsset, isBnbChain } from '../../../helpers/chainHelper'
import { ValidatePasswordHandler, WalletAccounts, WalletAddressAsync } from '../../../services/wallet/types'
import { walletTypeToI18n } from '../../../services/wallet/util'
import { InfoIcon } from '../../uielements/info'
import * as Styled from './WalletSettings.styles'

type Props = {
  selectedNetwork: Network
  walletAccounts: O.Option<WalletAccounts>
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  addLedgerAddress: (chain: Chain, walletIndex: number) => void
  verifyLedgerAddress: (chain: Chain, walletIndex?: number) => void
  removeLedgerAddress: (chain: Chain) => void
  phrase: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
}

export const WalletSettings: React.FC<Props> = (props): JSX.Element => {
  const intl = useIntl()
  const {
    selectedNetwork,
    walletAccounts: oWalletAccounts,
    runeNativeAddress = '',
    lockWallet = () => {},
    removeKeystore = () => {},
    exportKeystore = () => {},
    addLedgerAddress,
    verifyLedgerAddress,
    removeLedgerAddress,
    phrase: oPhrase,
    clickAddressLinkHandler,
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
  const [showRemoveWalletModal, setShowRemoveWalletModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState<O.Option<{ asset: Asset; address: Address }>>(O.none)
  const closeQrModal = useCallback(() => setShowQRModal(O.none), [setShowQRModal])
  const [walletIndex, setWalletIndex] = useState<number>(0)

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

  const onSuccessPassword = useCallback(() => {
    setShowPasswordModal(false)
    setShowPhraseModal(true)
  }, [setShowPasswordModal, setShowPhraseModal])

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
    (chain: Chain, { type: walletType, address: addressRD }: WalletAddressAsync) => {
      const renderAddLedger = (chain: Chain, loading: boolean) => (
        <Styled.AddLedgerContainer>
          <Styled.AddLedgerButton loading={loading} onClick={() => addLedgerAddress(chain, walletIndex)}>
            <Styled.AddLedgerIcon /> {intl.formatMessage({ id: 'ledger.add.device' })}
          </Styled.AddLedgerButton>
          {isBnbChain(chain) && (
            <>
              <Styled.IndexLabel>{intl.formatMessage({ id: 'setting.wallet.index' })}</Styled.IndexLabel>
              <Styled.WalletIndexInput
                value={walletIndex.toString()}
                pattern="[0-9]+"
                onChange={(value) => value !== null && +value >= 0 && setWalletIndex(+value)}
                style={{ width: 60 }}
                onPressEnter={() => addLedgerAddress(chain, walletIndex)}
              />
              <InfoIcon tooltip={intl.formatMessage({ id: 'setting.wallet.index.info' })} />
            </>
          )}
        </Styled.AddLedgerContainer>
      )

      // Render addresses depending on its loading status
      return (
        <Styled.AddressContainer>
          {FP.pipe(
            addressRD,
            RD.fold(
              () => (isLedgerWallet(walletType) ? renderAddLedger(chain, false) : <>...</>),
              () => (isLedgerWallet(walletType) ? renderAddLedger(chain, true) : <>...</>),
              (error) => (
                <div>
                  <Styled.AddressError>{error?.message ?? error.toString()}</Styled.AddressError>
                  {isLedgerWallet(walletType) && renderAddLedger(chain, false)}
                </div>
              ),
              ({ address }) => (
                <>
                  <Styled.AddressEllipsis address={address} chain={chain} network={selectedNetwork} enableCopy={true} />
                  <Styled.QRCodeIcon onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))} />
                  <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />
                  {isLedgerWallet(walletType) && (
                    <Styled.EyeOutlined onClick={() => verifyLedgerAddress(chain, walletIndex)} />
                  )}
                  {isLedgerWallet(walletType) && <Styled.RemoveLedgerIcon onClick={() => removeLedgerAddress(chain)} />}
                </>
              )
            )
          )}
        </Styled.AddressContainer>
      )
    },
    [
      addLedgerAddress,
      clickAddressLinkHandler,
      intl,
      removeLedgerAddress,
      selectedNetwork,
      verifyLedgerAddress,
      walletIndex
    ]
  )

  const accounts = useMemo(
    () =>
      FP.pipe(
        oWalletAccounts,
        O.map((walletAccounts) => (
          <Col key={'accounts'} span={24}>
            <Styled.Subtitle>{intl.formatMessage({ id: 'setting.account.management' })}</Styled.Subtitle>
            <Styled.AccountCard>
              <List
                dataSource={walletAccounts}
                renderItem={({ chain, accounts }, i: number) => (
                  <Styled.ListItem key={i}>
                    <Styled.AccountTitleWrapper>
                      <AssetIcon asset={getChainAsset(chain)} size={'small'} network="mainnet" />
                      <Styled.AccountTitle>{chain}</Styled.AccountTitle>
                    </Styled.AccountTitleWrapper>
                    {accounts.map((account, j) => {
                      const { type } = account
                      return (
                        <Styled.AccountContent key={j}>
                          <Styled.AccountPlaceholder>{walletTypeToI18n(type, intl)}</Styled.AccountPlaceholder>
                          {renderAddress(chain, account)}
                        </Styled.AccountContent>
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

  return (
    <Styled.ContainerWrapper>
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
      <Styled.Row gutter={[16, 16]}>
        <Col span={24}>
          <Styled.Subtitle>{intl.formatMessage({ id: 'setting.wallet.management' })}</Styled.Subtitle>
          <Styled.Card>
            <Row style={{ flex: 1, alignItems: 'center' }}>
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
        </Col>
        {accounts}
      </Styled.Row>
    </Styled.ContainerWrapper>
  )
}
