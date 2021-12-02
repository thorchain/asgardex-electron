import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  BNBChain,
  THORChain,
  ETHChain,
  PolkadotChain,
  BCHChain,
  BTCChain,
  LTCChain,
  CosmosChain,
  Chain
} from '@xchainjs/xchain-util'
import { Col, List, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { isLedgerWallet } from '../../../../shared/utils/guard'
import { ReactComponent as UnlockOutlined } from '../../../assets/svg/icon-unlock-warning.svg'
import { WalletPasswordConfirmationModal } from '../../../components/modal/confirmation'
import { RemoveWalletConfirmationModal } from '../../../components/modal/confirmation/RemoveWalletConfirmationModal'
import { AssetIcon } from '../../../components/uielements/assets/assetIcon/AssetIcon'
import { QRCodeModal } from '../../../components/uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../../../components/wallet/phrase/PhraseCopyModal'
import { getChainAsset, isBnbChain, isThorChain } from '../../../helpers/chainHelper'
import { ValidatePasswordHandler, WalletAccounts, WalletAddressAsync } from '../../../services/wallet/types'
import { walletTypeToI18n } from '../../../services/wallet/util'
import { InfoIcon } from '../../uielements/info'
import { Modal } from '../../uielements/modal'
import * as Styled from './WalletSettings.styles'

type Props = {
  selectedNetwork: Network
  walletAccounts: O.Option<WalletAccounts>
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  addLedgerAddress: (chain: Chain, walletIndex: number) => void
  verifyLedgerAddress: (chain: Chain, walletIndex: number) => void
  removeLedgerAddress: (chain: Chain) => void
  phrase: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
}

type AddressToVerify = O.Option<{ address: Address; chain: Chain }>

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

  const [walletIndexMap, setWalletIndexMap] = useState<Record<Chain, number>>({
    [BNBChain]: 0,
    [BTCChain]: 0,
    [BCHChain]: 0,
    [LTCChain]: 0,
    [THORChain]: 0,
    [ETHChain]: 0,
    [CosmosChain]: 0,
    [PolkadotChain]: 0
  })

  const renderAddress = useCallback(
    (chain: Chain, { type: walletType, address: addressRD }: WalletAddressAsync) => {
      const renderAddLedger = (chain: Chain, loading: boolean) => (
        <Styled.AddLedgerContainer>
          <Styled.AddLedgerButton loading={loading} onClick={() => addLedgerAddress(chain, walletIndexMap[chain])}>
            <Styled.AddLedgerIcon /> {intl.formatMessage({ id: 'ledger.add.device' })}
          </Styled.AddLedgerButton>
          {(isBnbChain(chain) || isThorChain(chain)) && (
            <>
              <Styled.IndexLabel>{intl.formatMessage({ id: 'setting.wallet.index' })}</Styled.IndexLabel>
              <Styled.WalletIndexInput
                value={walletIndexMap[chain].toString()}
                pattern="[0-9]+"
                onChange={(value) =>
                  value !== null && +value >= 0 && setWalletIndexMap({ ...walletIndexMap, [chain]: +value })
                }
                style={{ width: 60 }}
                onPressEnter={() => addLedgerAddress(chain, walletIndexMap[chain])}
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
              ({ address, walletIndex }) => (
                <>
                  <Styled.AddressWrapper>
                    <Styled.AddressEllipsis
                      address={address}
                      chain={chain}
                      network={selectedNetwork}
                      enableCopy={true}
                    />
                    <Styled.QRCodeIcon
                      onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))}
                    />
                    <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />
                  </Styled.AddressWrapper>
                  {isLedgerWallet(walletType) && (
                    <Styled.EyeOutlined
                      onClick={() => {
                        setAddressToVerify(
                          O.some({
                            address,
                            chain
                          })
                        )
                        verifyLedgerAddress(chain, walletIndex)
                      }}
                    />
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
      walletIndexMap
    ]
  )

  const [addressToVerify, setAddressToVerify] = useState<AddressToVerify>(O.none)

  const renderVerifyAddressModal = useCallback(
    (oAddress: AddressToVerify) =>
      FP.pipe(
        oAddress,
        O.fold(
          () => <></>,
          ({ address, chain }) => (
            <Modal
              title={intl.formatMessage({ id: 'wallet.ledger.verifyAddress.modal.title' })}
              visible={true}
              onOk={() => setAddressToVerify(O.none)}
              onCancel={() => {
                removeLedgerAddress(chain)
                setAddressToVerify(O.none)
              }}
              maskClosable={false}
              closable={false}
              okText={intl.formatMessage({ id: 'common.confirm' })}
              okButtonProps={{ autoFocus: true }}
              cancelText={intl.formatMessage({ id: 'common.reject' })}>
              <div style={{ textAlign: 'center' }}>
                <FormattedMessage
                  id="wallet.ledger.verifyAddress.modal.description"
                  values={{
                    address: <Styled.AddressToVerifyLabel>{address}</Styled.AddressToVerifyLabel>
                  }}
                />
              </div>
            </Modal>
          )
        )
      ),
    [intl, removeLedgerAddress]
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
                        <Styled.AccountAddressWrapper key={type}>
                          <Styled.WalletTypeLabel>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>
                          <Styled.AccountContent key={j}>{renderAddress(chain, account)}</Styled.AccountContent>
                        </Styled.AccountAddressWrapper>
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
    [oWalletAccounts, intl, renderAddress]
  )

  return (
    <Styled.ContainerWrapper>
      {showPasswordModal && (
        <WalletPasswordConfirmationModal
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
          {renderVerifyAddressModal(addressToVerify)}
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
