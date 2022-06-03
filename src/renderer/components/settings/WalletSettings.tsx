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
  Chain,
  DOGEChain,
  TerraChain
} from '@xchainjs/xchain-util'
import { Col, List, Collapse, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { FormattedMessage, useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet } from '../../../shared/utils/guard'
import { ReactComponent as UnlockOutlined } from '../../assets/svg/icon-unlock-warning.svg'
import { WalletPasswordConfirmationModal } from '../../components/modal/confirmation'
import { RemoveWalletConfirmationModal } from '../../components/modal/confirmation/RemoveWalletConfirmationModal'
import { AssetIcon } from '../../components/uielements/assets/assetIcon/AssetIcon'
import { QRCodeModal } from '../../components/uielements/qrCodeModal/QRCodeModal'
import { PhraseCopyModal } from '../../components/wallet/phrase/PhraseCopyModal'
import {
  getChainAsset,
  isBchChain,
  isBnbChain,
  isBtcChain,
  isDogeChain,
  isEthChain,
  isLtcChain,
  isTerraChain,
  isThorChain
} from '../../helpers/chainHelper'
import { isEnabledWallet } from '../../helpers/walletHelper'
import { ValidatePasswordHandler, WalletAccounts, WalletAddressAsync } from '../../services/wallet/types'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AttentionIcon } from '../icons'
import { InfoIcon } from '../uielements/info'
import { Modal } from '../uielements/modal'
import * as CStyled from './Common.styles'
import * as Styled from './WalletSettings.styles'

type Props = {
  network: Network
  walletAccounts: O.Option<WalletAccounts>
  runeNativeAddress: string
  lockWallet: FP.Lazy<void>
  removeKeystore: FP.Lazy<void>
  exportKeystore: (runeNativeAddress: string, selectedNetwork: Network) => void
  addLedgerAddress: (chain: Chain, walletIndex: number) => void
  verifyLedgerAddress: (chain: Chain, walletIndex: number) => Promise<boolean>
  removeLedgerAddress: (chain: Chain) => void
  phrase: O.Option<string>
  clickAddressLinkHandler: (chain: Chain, address: Address) => void
  validatePassword$: ValidatePasswordHandler
  collapsed: boolean
  toggleCollapse: FP.Lazy<void>
}

type AddressToVerify = O.Option<{ address: Address; chain: Chain }>

export const WalletSettings: React.FC<Props> = (props): JSX.Element => {
  const {
    network,
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
    validatePassword$,
    collapsed,
    toggleCollapse
  } = props

  const intl = useIntl()

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
          network={network}
          visible={true}
          onCancel={closeQrModal}
          onOk={closeQrModal}
        />
      )),
      O.getOrElse(() => <></>)
    )
  }, [showQRModal, network, closeQrModal])

  const [walletIndexMap, setWalletIndexMap] = useState<Record<Chain, number>>({
    [BNBChain]: 0,
    [BTCChain]: 0,
    [BCHChain]: 0,
    [LTCChain]: 0,
    [THORChain]: 0,
    [ETHChain]: 0,
    [CosmosChain]: 0,
    [PolkadotChain]: 0,
    [DOGEChain]: 0,
    [TerraChain]: 0
  })

  const [addressToVerify, setAddressToVerify] = useState<AddressToVerify>(O.none)

  const rejectLedgerAddress = useCallback(
    (chain: Chain) => {
      removeLedgerAddress(chain)
      setAddressToVerify(O.none)
    },
    [removeLedgerAddress]
  )

  const renderAddress = useCallback(
    (chain: Chain, { type: walletType, address: addressRD }: WalletAddressAsync) => {
      const verifyLedgerAddressHandler = async (address: Address, walletIndex: number) => {
        setAddressToVerify(
          O.some({
            address,
            chain
          })
        )
        try {
          const result = await verifyLedgerAddress(chain, walletIndex)
          !result ? rejectLedgerAddress(chain) : setAddressToVerify(O.none) /* close modal */
        } catch (_) {
          rejectLedgerAddress(chain)
        }
      }

      const renderAddLedger = (chain: Chain, loading: boolean) => (
        <Styled.AddLedgerContainer>
          <Styled.AddLedgerButton loading={loading} onClick={() => addLedgerAddress(chain, walletIndexMap[chain])}>
            <Styled.AddLedgerIcon /> {intl.formatMessage({ id: 'ledger.add.device' })}
          </Styled.AddLedgerButton>
          {(isBnbChain(chain) ||
            isThorChain(chain) ||
            isBtcChain(chain) ||
            isLtcChain(chain) ||
            isBchChain(chain) ||
            isDogeChain(chain) ||
            isTerraChain(chain) ||
            isEthChain(chain)) && (
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
                    <Styled.AddressEllipsis address={address} chain={chain} network={network} enableCopy={true} />
                    <Styled.QRCodeIcon
                      onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))}
                    />
                    <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />

                    {isLedgerWallet(walletType) && (
                      <Styled.EyeOutlined onClick={() => verifyLedgerAddressHandler(address, walletIndex)} />
                    )}

                    {isLedgerWallet(walletType) && (
                      <Styled.RemoveLedgerIcon onClick={() => removeLedgerAddress(chain)} />
                    )}
                  </Styled.AddressWrapper>
                </>
              )
            )
          )}
        </Styled.AddressContainer>
      )
    },
    [
      verifyLedgerAddress,
      rejectLedgerAddress,
      intl,
      walletIndexMap,
      addLedgerAddress,
      network,
      clickAddressLinkHandler,
      removeLedgerAddress
    ]
  )

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
              onCancel={() => rejectLedgerAddress(chain)}
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
    [intl, rejectLedgerAddress]
  )

  const renderAccounts = useMemo(
    () =>
      FP.pipe(
        oWalletAccounts,
        O.map((walletAccounts) => (
          <Col key={'accounts'} span={24}>
            <Styled.AccountCard>
              <Styled.Subtitle>{intl.formatMessage({ id: 'setting.account.management' })}</Styled.Subtitle>
              <List
                dataSource={walletAccounts}
                renderItem={({ chain, accounts }, i: number) => (
                  <Styled.ListItem key={i}>
                    <Styled.AccountTitleWrapper>
                      <AssetIcon asset={getChainAsset(chain)} size={'small'} network="mainnet" />
                      <Styled.AccountTitle>{chain}</Styled.AccountTitle>
                    </Styled.AccountTitleWrapper>
                    {/* supported Ledger */}
                    {FP.pipe(
                      accounts,
                      A.filter(({ type }) => isEnabledWallet(chain, network, type)),
                      A.mapWithIndex((index, account) => {
                        const { type } = account
                        return (
                          <Styled.AccountAddressWrapper key={type}>
                            <Styled.WalletTypeLabel>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>
                            <Styled.AccountContent key={index}>{renderAddress(chain, account)}</Styled.AccountContent>
                          </Styled.AccountAddressWrapper>
                        )
                      })
                    )}
                    {/* unsupported Ledger */}
                    {FP.pipe(
                      accounts,
                      A.filter(({ type }) => !isEnabledWallet(chain, network, type)),
                      A.map((account) => {
                        const { type } = account
                        return (
                          <Styled.AccountAddressWrapper key={type}>
                            <Styled.WalletTypeLabel>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>

                            <Styled.NotSupportedWrapper>
                              <Styled.Icon component={AttentionIcon} />
                              {intl.formatMessage({ id: 'common.notsupported.fornetwork' }, { network })}
                            </Styled.NotSupportedWrapper>
                          </Styled.AccountAddressWrapper>
                        )
                      })
                    )}
                  </Styled.ListItem>
                )}
              />
            </Styled.AccountCard>
          </Col>
        )),
        O.getOrElse(() => <></>)
      ),
    [oWalletAccounts, intl, renderAddress, network]
  )

  return (
    <Styled.Container>
      <CStyled.Collapse
        expandIcon={({ isActive }) => <CStyled.ExpandIcon rotate={isActive ? 90 : 0} />}
        activeKey={collapsed ? '0' : '1'}
        expandIconPosition="right"
        onChange={toggleCollapse}
        ghost>
        <Collapse.Panel
          header={<CStyled.Title>{intl.formatMessage({ id: 'setting.wallet.title' })}</CStyled.Title>}
          key={'1'}>
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

          {renderVerifyAddressModal(addressToVerify)}
          <Styled.CardContainer>
            <Styled.Card>
              <Styled.Subtitle>{intl.formatMessage({ id: 'setting.wallet.management' })}</Styled.Subtitle>
              <Row style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                <Styled.WalletCol sm={{ span: 24 }} md={{ span: 12 }}>
                  <Styled.OptionCard bordered={false}>
                    <Styled.OptionLabel
                      color="primary"
                      size="big"
                      onClick={() => exportKeystore(runeNativeAddress, network)}>
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
          </Styled.CardContainer>
          {renderAccounts}
        </Collapse.Panel>
      </CStyled.Collapse>
    </Styled.Container>
  )
}
