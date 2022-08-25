import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SearchOutlined } from '@ant-design/icons'
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
  TerraChain,
  chainToString
} from '@xchainjs/xchain-util'
import { List, Collapse, RadioChangeEvent } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { FormattedMessage, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import * as Rx from 'rxjs'

import { KeystoreId, Network } from '../../../shared/api/types'
import { getDerivationPath as getEthDerivationPath } from '../../../shared/ethereum/ledger'
import { EthDerivationMode } from '../../../shared/ethereum/types'
import { isError, isLedgerWallet } from '../../../shared/utils/guard'
import { WalletAddress } from '../../../shared/wallet/types'
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
  isCosmosChain,
  isDogeChain,
  isEthChain,
  isLtcChain,
  isThorChain
} from '../../helpers/chainHelper'
import { emptyString } from '../../helpers/stringHelper'
import { isEnabledWallet } from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import * as appRoutes from '../../routes/app'
import * as walletRoutes from '../../routes/wallet'
import {
  KeystoreWalletsUI,
  RemoveKeystoreWalletHandler,
  ValidatePasswordHandler,
  WalletAccounts,
  KeystoreUnlocked,
  ChangeKeystoreWalletHandler,
  ChangeKeystoreWalletRD,
  RenameKeystoreWalletHandler,
  RenameKeystoreWalletRD
} from '../../services/wallet/types'
import { walletTypeToI18n } from '../../services/wallet/util'
import { AttentionIcon } from '../icons'
import * as StyledR from '../shared/form/Radio.styles'
import { BorderButton, FlatButton, TextButton } from '../uielements/button'
import { InfoIcon } from '../uielements/info'
import { Modal } from '../uielements/modal'
import { WalletSelector } from '../uielements/wallet'
import { EditableWalletName } from '../uielements/wallet/EditableWalletName'
import * as CStyled from './Common.styles'
import * as Styled from './WalletSettings.styles'

type Props = {
  network: Network
  walletAccounts: O.Option<WalletAccounts>
  lockWallet: FP.Lazy<void>
  removeKeystoreWallet: RemoveKeystoreWalletHandler
  changeKeystoreWallet$: ChangeKeystoreWalletHandler
  renameKeystoreWallet$: RenameKeystoreWalletHandler
  exportKeystore: () => Promise<void>
  addLedgerAddress: (params: {
    chain: Chain
    walletIndex: number
    ethDerivationMode: O.Option<EthDerivationMode>
  }) => void
  verifyLedgerAddress$: (chain: Chain) => Rx.Observable<RD.RemoteData<Error, boolean>>
  removeLedgerAddress: (chain: Chain) => void
  keystoreUnlocked: KeystoreUnlocked
  wallets: KeystoreWalletsUI
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
    lockWallet,
    removeKeystoreWallet,
    changeKeystoreWallet$,
    renameKeystoreWallet$,
    exportKeystore,
    addLedgerAddress,
    verifyLedgerAddress$,
    removeLedgerAddress,
    keystoreUnlocked: { phrase, name: walletName, id: walletId },
    wallets,
    clickAddressLinkHandler,
    validatePassword$,
    collapsed,
    toggleCollapse
  } = props

  const intl = useIntl()
  const navigate = useNavigate()

  const [showPhraseModal, setShowPhraseModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showRemoveWalletModal, setShowRemoveWalletModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState<O.Option<{ asset: Asset; address: Address }>>(O.none)
  const closeQrModal = useCallback(() => setShowQRModal(O.none), [setShowQRModal])

  const removeWalletHandler = useCallback(async () => {
    const noWallets = await removeKeystoreWallet()
    if (noWallets >= 1) {
      // goto unlock screen to unlock another wallet
      navigate(walletRoutes.locked.path())
    } else {
      // no wallet -> go to homepage
      navigate(appRoutes.base.template)
    }
  }, [removeKeystoreWallet, navigate])

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
    [PolkadotChain]: 0, // not supported in ASGDX, but part of xchain-util
    [DOGEChain]: 0,
    [TerraChain]: 0 // not supported in ASGDX anymore, but part of xchain-util
  })

  const [addressToVerify, setAddressToVerify] = useState<AddressToVerify>(O.none)

  const rejectLedgerAddress = useCallback(
    (chain: Chain) => {
      removeLedgerAddress(chain)
      setAddressToVerify(O.none)
    },
    [removeLedgerAddress]
  )

  const [ethDerivationMode, setEthDerivationMode] = useState<EthDerivationMode>('ledgerlive')

  const renderAddress = useCallback(
    (chain: Chain, { type: walletType, address, walletIndex }: WalletAddress) => {
      const verifyLedgerAddressHandler = () => {
        setAddressToVerify(
          O.some({
            address,
            chain
          })
        )
        try {
          const result = verifyLedgerAddress$(chain)
          // TODO/@veado) Fix: Use `useSubscriptionState` to handle verification state
          !result ? rejectLedgerAddress(chain) : setAddressToVerify(O.none) /* close modal */
        } catch (_) {
          rejectLedgerAddress(chain)
        }
      }

      const onChangeEthDerivationMode = (e: RadioChangeEvent) => {
        setEthDerivationMode(e.target.value as EthDerivationMode)
      }

      const addLedgerAddressHandler = () => {
        addLedgerAddress({
          chain,
          walletIndex,
          ethDerivationMode: isEthChain(chain) ? O.some(ethDerivationMode) : O.none
        })
      }

      // TODO(@veado) Bring it back
      const _renderAddLedger = (chain: Chain, loading: boolean) => (
        <div className="flex w-full flex-col md:w-auto lg:flex-row">
          <div className="mr-30px flex items-center md:mr-0">
            <Styled.AddLedgerButton loading={loading} onClick={addLedgerAddressHandler}>
              <Styled.AddLedgerIcon /> {intl.formatMessage({ id: 'ledger.add.device' })}
            </Styled.AddLedgerButton>
            {(isBnbChain(chain) ||
              isThorChain(chain) ||
              isBtcChain(chain) ||
              isLtcChain(chain) ||
              isBchChain(chain) ||
              isDogeChain(chain) ||
              isEthChain(chain) ||
              isCosmosChain(chain)) && (
              <>
                <div className="text-[12px] uppercase text-text2 dark:text-text2d">
                  {intl.formatMessage({ id: 'setting.wallet.index' })}
                </div>
                <Styled.WalletIndexInput
                  value={walletIndexMap[chain].toString()}
                  pattern="[0-9]+"
                  onChange={(value) =>
                    value !== null && +value >= 0 && setWalletIndexMap({ ...walletIndexMap, [chain]: +value })
                  }
                  style={{ width: 60 }}
                  onPressEnter={addLedgerAddressHandler}
                />
                <InfoIcon tooltip={intl.formatMessage({ id: 'setting.wallet.index.info' })} />
              </>
            )}
          </div>
          {isEthChain(chain) && (
            <StyledR.Radio.Group
              className="!flex flex-col items-start lg:flex-row lg:items-center lg:!pl-30px"
              onChange={onChangeEthDerivationMode}
              value={ethDerivationMode}>
              <StyledR.Radio value="ledgerlive" key="ledgerlive">
                <Styled.EthDerivationModeRadioLabel>
                  {intl.formatMessage({ id: 'common.ledgerlive' })}
                  <InfoIcon
                    tooltip={intl.formatMessage(
                      { id: 'setting.wallet.hdpath.ledgerlive.info' },
                      { path: getEthDerivationPath(walletIndexMap[ETHChain], 'ledgerlive') }
                    )}
                  />
                </Styled.EthDerivationModeRadioLabel>
              </StyledR.Radio>
              <StyledR.Radio value="legacy" key="legacy">
                <Styled.EthDerivationModeRadioLabel>
                  {intl.formatMessage({ id: 'common.legacy' })}
                  <InfoIcon
                    tooltip={intl.formatMessage(
                      { id: 'setting.wallet.hdpath.legacy.info' },
                      { path: getEthDerivationPath(walletIndexMap[ETHChain], 'legacy') }
                    )}
                  />
                </Styled.EthDerivationModeRadioLabel>
              </StyledR.Radio>
              <StyledR.Radio value="metamask" key="metamask">
                <Styled.EthDerivationModeRadioLabel>
                  {intl.formatMessage({ id: 'common.metamask' })}
                  <InfoIcon
                    tooltip={intl.formatMessage(
                      { id: 'setting.wallet.hdpath.metamask.info' },
                      { path: getEthDerivationPath(walletIndexMap[ETHChain], 'metamask') }
                    )}
                  />
                </Styled.EthDerivationModeRadioLabel>
              </StyledR.Radio>
            </StyledR.Radio.Group>
          )}
        </div>
      )

      // Render addresses depending on its loading status
      return (
        <>
          <div className="flex w-full items-center">
            <Styled.AddressEllipsis address={address} chain={chain} network={network} enableCopy={true} />
            <Styled.QRCodeIcon onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))} />
            <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />

            {isLedgerWallet(walletType) && (
              <>
                <Styled.EyeOutlined onClick={() => verifyLedgerAddressHandler()} />
                <Styled.RemoveLedgerIcon onClick={() => removeLedgerAddress(chain)} />
              </>
            )}
          </div>
        </>
        // TODO (@veado) Show error / pending state for ledger

        // <div className="flex flex-row items-center">
        //   {FP.pipe(
        //     addressRD,
        //     RD.fold(
        //       () => (isLedgerWallet(walletType) ? renderAddLedger(chain, false) : <>...</>),
        //       () => (isLedgerWallet(walletType) ? renderAddLedger(chain, true) : <>...</>),
        //       (error) => (
        //         <div>
        //           <Styled.AddressError>{error?.message ?? error.toString()}</Styled.AddressError>
        //           {isLedgerWallet(walletType) && renderAddLedger(chain, false)}
        //         </div>
        //       ),
        //       ({ address, walletIndex }) => (
        //         <>
        //           <div className="flex w-full items-center">
        //             <Styled.AddressEllipsis address={address} chain={chain} network={network} enableCopy={true} />
        //             <Styled.QRCodeIcon
        //               onClick={() => setShowQRModal(O.some({ asset: getChainAsset(chain), address }))}
        //             />
        //             <Styled.AddressLinkIcon onClick={() => clickAddressLinkHandler(chain, address)} />

        //             {isLedgerWallet(walletType) && (
        //               <>
        //                 <Styled.EyeOutlined onClick={() => verifyLedgerAddressHandler(address)} />
        //                 <Styled.RemoveLedgerIcon onClick={() => removeLedgerAddress(chain)} />
        //               </>
        //             )}
        //           </div>
        //         </>
        //       )
        //     )
        //   )}
        // </div>
      )
    },
    [
      ethDerivationMode,
      verifyLedgerAddress$,
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
              <div className="text-center">
                <FormattedMessage
                  id="wallet.ledger.verifyAddress.modal.description"
                  values={{
                    address: (
                      <span className="block transform-none font-mainBold text-[16px] text-inherit">{address}</span>
                    )
                  }}
                />
              </div>
            </Modal>
          )
        )
      ),
    [intl, rejectLedgerAddress]
  )

  const [accountFilter, setAccountFilter] = useState(emptyString)

  const filterAccounts = useCallback(({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const value = target.value
    setAccountFilter(value.toLowerCase())
  }, [])

  const oFilteredWalletAccounts = useMemo(
    () =>
      FP.pipe(
        oWalletAccounts,
        O.map((walletAccounts) =>
          FP.pipe(
            walletAccounts,
            A.filter(({ chain }) =>
              accountFilter
                ? chain.toLowerCase().startsWith(accountFilter) ||
                  chainToString(chain).toLowerCase().startsWith(accountFilter)
                : true
            )
          )
        )
      ),
    [accountFilter, oWalletAccounts]
  )

  // TODO (@Veado) Render `exportKeystoreErrorMsg`
  const [_ /* exportKeystoreErrorMsg */, setExportKeystoreErrorMsg] = useState(emptyString)

  const exportKeystoreHandler = useCallback(async () => {
    try {
      setExportKeystoreErrorMsg(emptyString)
      await exportKeystore()
    } catch (error) {
      const errorMsg = isError(error) ? error?.message ?? error.toString() : `${error}`
      setExportKeystoreErrorMsg(errorMsg)
    }
  }, [exportKeystore, setExportKeystoreErrorMsg])

  const renderAccounts = useMemo(
    () =>
      FP.pipe(
        oFilteredWalletAccounts,
        O.map((walletAccounts) => (
          <List
            key="accounts"
            dataSource={walletAccounts}
            renderItem={({ chain, accounts }, i: number) => (
              <Styled.ListItem key={i}>
                <div className="flex w-full items-center">
                  <AssetIcon asset={getChainAsset(chain)} size="small" network="mainnet" />
                  <Styled.AccountTitle>{chain}</Styled.AccountTitle>
                </div>
                {/* supported Ledger */}
                {FP.pipe(
                  accounts,
                  A.filter(({ type }) => isEnabledWallet(chain, network, type)),
                  A.mapWithIndex((index, account) => {
                    const { type } = account
                    return (
                      <div className="mt-10px w-full" key={type}>
                        <Styled.WalletTypeLabel>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>
                        <div className="my-0 mx-40px w-full overflow-hidden " key={index}>
                          {renderAddress(chain, account)}
                        </div>
                      </div>
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
                      <div className="mt-10px w-full" key={type}>
                        <Styled.WalletTypeLabel>{walletTypeToI18n(type, intl)}</Styled.WalletTypeLabel>
                        <div className="ml-40px flex items-center pt-5px text-[12px] text-text2 dark:text-text2d">
                          <Styled.Icon component={AttentionIcon} />
                          {intl.formatMessage({ id: 'common.notsupported.fornetwork' }, { network })}
                        </div>
                      </div>
                    )
                  })
                )}
              </Styled.ListItem>
            )}
          />
        )),
        O.getOrElse(() => <></>)
      ),
    [oFilteredWalletAccounts, intl, renderAddress, network]
  )

  const { state: changeWalletState, subscribe: subscribeChangeWalletState } =
    useSubscriptionState<ChangeKeystoreWalletRD>(RD.initial)

  const changeWalletHandler = useCallback(
    (id: KeystoreId) => {
      subscribeChangeWalletState(changeKeystoreWallet$(id))
    },
    [changeKeystoreWallet$, subscribeChangeWalletState]
  )

  const renderChangeWalletError = useMemo(
    () =>
      FP.pipe(
        changeWalletState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => (
            <p className="px-5px font-main text-14 uppercase text-error0 dark:text-error0d">
              {intl.formatMessage({ id: 'wallet.change.error' })} {error.message || error.toString()}
            </p>
          ),

          () => <></>
        )
      ),
    [changeWalletState, intl]
  )

  useEffect(() => {
    if (RD.isSuccess(changeWalletState)) {
      // Jump to `UnlockView` to avoid staying at wallet settings
      navigate(walletRoutes.locked.path())
    }
  }, [changeWalletState, navigate])

  const { state: renameWalletState, subscribe: subscribeRenameWalletState } =
    useSubscriptionState<RenameKeystoreWalletRD>(RD.initial)

  const changeWalletNameHandler = useCallback(
    (walletName: string) => {
      subscribeRenameWalletState(renameKeystoreWallet$(walletId, walletName))
    },
    [renameKeystoreWallet$, subscribeRenameWalletState, walletId]
  )

  const renderRenameWalletError = useMemo(
    () =>
      FP.pipe(
        renameWalletState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => (
            <p className="text-center font-main text-[14px] uppercase text-error0">
              {intl.formatMessage({ id: 'wallet.name.error.rename' })} {error?.message ?? error.toString()}
            </p>
          ),
          () => <></>
        )
      ),
    [intl, renameWalletState]
  )

  return (
    <div className="mt-40px bg-bg0 py-10px px-40px dark:bg-bg0d">
      <CStyled.Collapse
        expandIcon={({ isActive }) => <CStyled.ExpandIcon rotate={isActive ? 90 : 0} />}
        activeKey={collapsed ? '0' : '1'}
        expandIconPosition="end"
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
            onSuccess={() => removeWalletHandler()}
            walletName={walletName}
          />
          {renderQRCodeModal}

          {renderVerifyAddressModal(addressToVerify)}
          <div className="card my-20px w-full ">
            <h1 className="p-20px font-main text-18 uppercase text-text0 dark:text-text0d">
              {intl.formatMessage({ id: 'setting.wallet.management' })}
            </h1>
            <EditableWalletName
              name={walletName}
              onChange={changeWalletNameHandler}
              loading={RD.isPending(renameWalletState)}
            />
            {renderRenameWalletError}
            <div className="mt-30px flex flex-col items-center md:flex-row">
              <div className="flex w-full justify-center md:w-1/2">
                <TextButton
                  className="m-0 min-w-[200px] md:m-20px"
                  color="primary"
                  size="normal"
                  onClick={exportKeystoreHandler}>
                  {intl.formatMessage({ id: 'setting.export' })}
                </TextButton>
              </div>
              <div className="flex w-full justify-center md:w-1/2">
                <TextButton className="m-0 min-w-[200px] md:m-20px" color="warning" size="normal" onClick={lockWallet}>
                  {intl.formatMessage({ id: 'setting.lock' })} <UnlockOutlined />
                </TextButton>
              </div>
            </div>
            <div className="flex flex-col items-center md:flex-row">
              <div className="flex w-full justify-center md:w-1/2">
                <BorderButton
                  className="m-10px min-w-[200px] md:m-20px"
                  size="normal"
                  color="primary"
                  onClick={() => setShowPasswordModal(true)}>
                  {intl.formatMessage({ id: 'setting.view.phrase' })}
                </BorderButton>
              </div>
              <div className="flex w-full justify-center md:w-1/2">
                <BorderButton
                  className="m-10px min-w-[200px] md:m-20px"
                  size="normal"
                  color="error"
                  onClick={() => setShowRemoveWalletModal(true)}>
                  {intl.formatMessage({ id: 'wallet.remove.label' })}
                </BorderButton>
              </div>
            </div>
          </div>

          <div className="card mb-20px w-full ">
            <h1 className="p-20px text-center font-main text-18 uppercase text-text0 dark:text-text0d md:text-left">
              {intl.formatMessage({ id: 'setting.multiwallet.management' })}
            </h1>

            <div className="flex flex-col py-20px md:flex-row">
              <div className="flex w-full flex-col items-center justify-center md:w-1/2">
                <h2 className="w-full text-center font-main text-[12px] uppercase text-text2 dark:text-text2d">
                  {intl.formatMessage({ id: 'wallet.add.another' })}
                </h2>
                <FlatButton
                  className="mt-5px min-w-[200px]"
                  size="normal"
                  color="primary"
                  onClick={() => navigate(walletRoutes.noWallet.path())}>
                  {intl.formatMessage({ id: 'wallet.add.label' })}
                </FlatButton>
              </div>
              <div className="mt-20px flex w-full flex-col items-center justify-center md:mt-0 md:w-1/2">
                <h2 className="w-full text-center font-main text-[12px] uppercase text-text2 dark:text-text2d">
                  {intl.formatMessage({ id: 'wallet.change.title' })}
                </h2>
                <WalletSelector
                  className="min-w-[200px]"
                  disabled={RD.isPending(changeWalletState)}
                  wallets={wallets}
                  onChange={changeWalletHandler}
                />
                {renderChangeWalletError}
              </div>
            </div>
          </div>
          <div key={'accounts'} className="w-full">
            <Styled.AccountCard>
              <Styled.Subtitle>{intl.formatMessage({ id: 'setting.accounts' })}</Styled.Subtitle>
              <div className="mt-30px flex justify-center md:ml-10px md:justify-start">
                <Styled.Input
                  prefix={<SearchOutlined />}
                  onChange={filterAccounts}
                  allowClear
                  placeholder={intl.formatMessage({ id: 'common.search' }).toUpperCase()}
                  size="large"
                />
              </div>
              {renderAccounts}
            </Styled.AccountCard>
          </div>
        </Collapse.Panel>
      </CStyled.Collapse>
    </div>
  )
}
