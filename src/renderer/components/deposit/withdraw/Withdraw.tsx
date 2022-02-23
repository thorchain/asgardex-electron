import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getWithdrawMemo } from '@thorchain/asgardex-util'
import {
  Asset,
  AssetRuneNative,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmount,
  Chain,
  formatAssetAmountCurrency,
  THORChain
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { isLedgerWallet } from '../../../../shared/utils/guard'
import { WalletAddress } from '../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { getTwoSigfigAssetAmount, THORCHAIN_DECIMAL, to1e8BaseAmount } from '../../../helpers/assetHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import * as PoolHelpers from '../../../helpers/poolHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { getZeroWithdrawFees } from '../../../services/chain/fees'
import {
  WithdrawState,
  SymWithdrawStateHandler,
  ReloadWithdrawFeesHandler,
  SymWithdrawFeesHandler,
  SymWithdrawFeesRD,
  SymWithdrawFees
} from '../../../services/chain/types'
import { GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../services/clients'
import { PoolsDataMap } from '../../../services/midgard/types'
import { MimirHalt } from '../../../services/thorchain/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { AssetWithDecimal } from '../../../types/asgardex'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../modal/confirmation'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { TooltipAddress } from '../../uielements/common/Common.styles'
import { Fees, UIFeesRD } from '../../uielements/fees'
import * as Helper from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

export type Props = {
  asset: AssetWithDecimal
  assetWalletAddress: WalletAddress
  /** Rune price (base amount) */
  runePrice: BigNumber
  /** Asset price (base amount) */
  assetPrice: BigNumber
  /** Wallet balance of Rune */
  runeBalance: O.Option<BaseAmount>
  runeWalletAddress: WalletAddress
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to reload fees */
  reloadFees: ReloadWithdrawFeesHandler
  /**
   * Shares of Rune and selected Asset.
   * Note: Decimal needs to be based on **original asset decimals**
   **/
  shares: { rune: BaseAmount; asset: BaseAmount }
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  openRuneExplorerTxUrl: OpenExplorerTxUrl
  getRuneExplorerTxUrl: GetExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  reloadBalances: FP.Lazy<void>
  withdraw$: SymWithdrawStateHandler
  fees$: SymWithdrawFeesHandler
  network: Network
  poolsData: PoolsDataMap
  haltedChains: Chain[]
  mimirHalt: MimirHalt
}

/**
 * Withdraw component
 *
 * Note: It supports sym. withdraw only
 *
 * */
export const Withdraw: React.FC<Props> = ({
  asset: assetWD,
  assetWalletAddress,
  runePrice,
  runeWalletAddress,
  assetPrice,
  runeBalance: oRuneBalance,
  selectedPriceAsset,
  shares: { rune: runeShare, asset: assetShare },
  disabled,
  openRuneExplorerTxUrl,
  getRuneExplorerTxUrl,
  validatePassword$,
  reloadBalances = FP.constVoid,
  reloadFees,
  withdraw$,
  fees$,
  network,
  poolsData,
  haltedChains,
  mimirHalt
}) => {
  const intl = useIntl()

  const { asset, decimal: assetDecimal } = assetWD

  const { type: runeWalletType, address: runeAddress, walletIndex: runeWalletIndex } = runeWalletAddress
  const { type: assetWalletType, address: assetAddress } = assetWalletAddress

  // Disable withdraw in case all or pool actions are disabled
  const disableWithdrawAction = useMemo(
    () =>
      PoolHelpers.disableAllActions({ chain: asset.chain, haltedChains, mimirHalt }) ||
      PoolHelpers.disablePoolActions({ chain: asset.chain, haltedChains, mimirHalt }),
    [asset.chain, haltedChains, mimirHalt]
  )

  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const zeroWithdrawPercent = useMemo(() => withdrawPercent <= 0, [withdrawPercent])

  const {
    state: withdrawState,
    reset: resetWithdrawState,
    subscribe: subscribeWithdrawState
  } = useSubscriptionState<WithdrawState>(INITIAL_WITHDRAW_STATE)

  const memo = useMemo(() => getWithdrawMemo({ asset, percent: withdrawPercent }), [asset, withdrawPercent])

  const { rune: runeAmountToWithdraw, asset: assetAmountToWithdraw } = Helper.getWithdrawAmounts(
    runeShare,
    assetShare,
    withdrawPercent
  )

  const zeroWithdrawFees: SymWithdrawFees = useMemo(() => getZeroWithdrawFees(AssetRuneNative), [])

  const assetPriceToWithdraw1e8 = useMemo(() => {
    // Prices are always `1e8` based,
    // that's why we have to convert `assetAmountToWithdraw` to `1e8` as well
    const assetAmountToWithdraw1e8 = to1e8BaseAmount(assetAmountToWithdraw)
    const priceBN = assetAmountToWithdraw1e8.amount().times(assetPrice)
    return baseAmount(priceBN, 8)
  }, [assetAmountToWithdraw, assetPrice])

  const prevWithdrawFees = useRef<O.Option<SymWithdrawFees>>(O.none)

  const [withdrawFeesRD] = useObservableState<SymWithdrawFeesRD>(
    () =>
      FP.pipe(
        fees$(asset),
        liveData.map((fees) => {
          // store every successfully loaded fees
          prevWithdrawFees.current = O.some(fees)
          return fees
        })
      ),
    RD.success(zeroWithdrawFees)
  )

  const withdrawFees: SymWithdrawFees = useMemo(
    () =>
      FP.pipe(
        withdrawFeesRD,
        RD.toOption,
        O.alt(() => prevWithdrawFees.current),
        O.getOrElse(() => zeroWithdrawFees)
      ),
    [withdrawFeesRD, zeroWithdrawFees]
  )

  const isInboundChainFeeError: boolean = useMemo(() => {
    if (zeroWithdrawPercent) return false

    return FP.pipe(
      oRuneBalance,
      O.fold(
        () => true,
        (balance) => FP.pipe(withdrawFees.rune, Helper.sumWithdrawFees, balance.lt)
      )
    )
  }, [oRuneBalance, withdrawFees.rune, zeroWithdrawPercent])

  const renderInboundChainFeeError = useMemo(() => {
    if (!isInboundChainFeeError) return <></>

    const runeBalance = FP.pipe(
      oRuneBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'deposit.withdraw.error.feeNotCovered' },
      {
        fee: formatAssetAmountCurrency({
          amount: baseToAsset(Helper.sumWithdrawFees(withdrawFees.rune)),
          asset: AssetRuneNative,
          trimZeros: true
        }),
        balance: formatAssetAmountCurrency({
          amount: baseToAsset(runeBalance),
          asset: AssetRuneNative,
          trimZeros: true
        })
      }
    )
    return <Styled.FeeErrorLabel key="fee-error">{msg}</Styled.FeeErrorLabel>
  }, [isInboundChainFeeError, oRuneBalance, intl, withdrawFees])

  const minRuneAmountToWithdraw = useMemo(() => Helper.minRuneAmountToWithdraw(withdrawFees.rune), [withdrawFees.rune])

  const minRuneAmountError = useMemo(
    () => !zeroWithdrawPercent && minRuneAmountToWithdraw.gt(runeAmountToWithdraw),
    [minRuneAmountToWithdraw, runeAmountToWithdraw, zeroWithdrawPercent]
  )

  const minAssetAmountToWithdrawMax1e8 = useMemo(
    () => Helper.minAssetAmountToWithdrawMax1e8({ fees: withdrawFees.asset, asset, assetDecimal, poolsData }),
    [asset, assetDecimal, poolsData, withdrawFees.asset]
  )

  const minAssetAmountError = useMemo(
    () => !zeroWithdrawPercent && minAssetAmountToWithdrawMax1e8.gt(assetAmountToWithdraw),
    [assetAmountToWithdraw, minAssetAmountToWithdrawMax1e8, zeroWithdrawPercent]
  )

  // Withdraw start time
  const [withdrawStartTime, setWithdrawStartTime] = useState<number>(0)

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: AssetRuneNative.ticker }),
      intl.formatMessage({ id: 'common.tx.checkResult' })
    ]
    const stepDescription = FP.pipe(
      withdrawState.withdraw,
      RD.fold(
        () => '',
        () =>
          `${intl.formatMessage(
            { id: 'common.step' },
            { current: withdrawState.step, total: withdrawState.stepsTotal }
          )}: ${stepDescriptions[withdrawState.step - 1]}`,
        () => '',
        () => `${intl.formatMessage({ id: 'common.done' })}!`
      )
    )

    return (
      <DepositAssets
        target={{ asset, amount: assetAmountToWithdraw }}
        source={O.some({ asset: AssetRuneNative, amount: runeAmountToWithdraw })}
        stepDescription={stepDescription}
        network={network}
      />
    )
  }, [intl, asset, withdrawState, assetAmountToWithdraw, runeAmountToWithdraw, network])

  const onFinishTxModal = useCallback(() => {
    resetWithdrawState()
    setWithdrawPercent(0)
    reloadBalances()
  }, [reloadBalances, resetWithdrawState, setWithdrawPercent])

  const renderTxModal = useMemo(() => {
    const { withdraw: withdrawRD, withdrawTx } = withdrawState

    // don't render TxModal in initial state
    if (RD.isInitial(withdrawRD)) return <></>

    // Get timer value
    const timerValue = FP.pipe(
      withdrawRD,
      RD.fold(
        () => 0,
        FP.flow(
          O.map(({ loaded }) => loaded),
          O.getOrElse(() => 0)
        ),
        () => 0,
        () => 100
      )
    )

    // title
    const txModalTitle = FP.pipe(
      withdrawRD,
      RD.fold(
        () => 'deposit.withdraw.pending',
        () => 'deposit.withdraw.pending',
        () => 'deposit.withdraw.error',
        () => 'deposit.withdraw.success'
      ),
      (id) => intl.formatMessage({ id })
    )

    const extraResult = (
      <Styled.ExtraContainer>
        {FP.pipe(withdrawTx, RD.toOption, (oTxHash) => (
          <Styled.ViewTxButtonTop
            txHash={oTxHash}
            onClick={openRuneExplorerTxUrl}
            txUrl={FP.pipe(oTxHash, O.chain(getRuneExplorerTxUrl))}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: AssetRuneNative.ticker })}
          />
        ))}
      </Styled.ExtraContainer>
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={resetWithdrawState}
        onFinish={onFinishTxModal}
        startTime={withdrawStartTime}
        txRD={withdrawRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={txModalExtraContent}
      />
    )
  }, [
    withdrawState,
    resetWithdrawState,
    onFinishTxModal,
    withdrawStartTime,
    txModalExtraContent,
    intl,
    openRuneExplorerTxUrl,
    getRuneExplorerTxUrl
  ])

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showLedgerModal, setShowLedgerModal] = useState(false)

  const onSubmit = useCallback(() => {
    if (isLedgerWallet(runeWalletType)) {
      setShowLedgerModal(true)
    } else {
      setShowPasswordModal(true)
    }
  }, [runeWalletType])

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false)
  }, [setShowPasswordModal])

  const onClosePasswordModal = useCallback(() => {
    // close password modal
    closePasswordModal()
  }, [closePasswordModal])

  const submitWithdrawTx = useCallback(() => {
    // set start time
    setWithdrawStartTime(Date.now())

    subscribeWithdrawState(
      withdraw$({
        network,
        memo,
        walletType: runeWalletType,
        walletIndex: runeWalletIndex
      })
    )
  }, [subscribeWithdrawState, withdraw$, network, memo, runeWalletType, runeWalletIndex])

  const onSucceedPasswordModal = useCallback(() => {
    closePasswordModal()
    submitWithdrawTx()
  }, [closePasswordModal, submitWithdrawTx])

  const onCloseLedgerModal = useCallback(() => {
    setShowLedgerModal(false)
  }, [])

  const onSucceedLedgerModal = useCallback(() => {
    setShowLedgerModal(false)
    submitWithdrawTx()
  }, [submitWithdrawTx])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        withdrawFeesRD,
        RD.map(({ rune: runeFees, asset: assetFees }) => [
          { asset: AssetRuneNative, amount: Helper.sumWithdrawFees(runeFees) },
          { asset: assetFees.asset, amount: assetFees.amount }
        ])
      ),
    [withdrawFeesRD]
  )

  const reloadFeesHandler = useCallback(() => {
    reloadFees(asset)
  }, [reloadFees, asset])

  // Load fees by every `onMount`
  useEffect(() => {
    reloadFees(asset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const disabledSubmit = useMemo(
    () =>
      disableWithdrawAction ||
      zeroWithdrawPercent ||
      disabled ||
      minAssetAmountError ||
      minRuneAmountError ||
      isInboundChainFeeError,
    [
      zeroWithdrawPercent,
      disabled,
      minAssetAmountError,
      minRuneAmountError,
      isInboundChainFeeError,
      disableWithdrawAction
    ]
  )

  return (
    <Styled.Container>
      <Styled.Title>{intl.formatMessage({ id: 'deposit.withdraw.sym.title' })}</Styled.Title>
      <Styled.Description>
        {intl.formatMessage({ id: 'deposit.withdraw.choseText' })} (
        <Styled.MinLabel color={minRuneAmountError || minAssetAmountError ? 'error' : 'normal'}>
          {intl.formatMessage({ id: 'common.min' })}:
        </Styled.MinLabel>
        <Styled.MinLabel color={minRuneAmountError ? 'error' : 'normal'}>
          {formatAssetAmountCurrency({
            amount: getTwoSigfigAssetAmount(baseToAsset(minRuneAmountToWithdraw)),
            asset: AssetRuneNative,
            trimZeros: true
          })}
        </Styled.MinLabel>{' '}
        /{' '}
        <Styled.MinLabel color={minAssetAmountError ? 'error' : 'normal'}>
          {formatAssetAmountCurrency({
            amount: baseToAsset(minAssetAmountToWithdrawMax1e8),
            asset,
            trimZeros: true
          })}
        </Styled.MinLabel>
        )
      </Styled.Description>
      <Styled.Slider
        key="asset amount slider"
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        onAfterChange={reloadFeesHandler}
        disabled={disabled || disableWithdrawAction}
        error={minRuneAmountError || minAssetAmountError}
      />
      <Styled.AssetOutputContainer>
        <TooltipAddress title={runeAddress}>
          <Styled.AssetContainer>
            <Styled.AssetIcon asset={AssetRuneNative} network={network} />
            <Styled.AssetLabel asset={AssetRuneNative} />
            {isLedgerWallet(runeWalletType) && (
              <Styled.WalletTypeLabel>{intl.formatMessage({ id: 'ledger.title' })}</Styled.WalletTypeLabel>
            )}
          </Styled.AssetContainer>
        </TooltipAddress>
        <Styled.OutputContainer>
          <Styled.OutputLabel>
            {formatAssetAmount({
              amount: getTwoSigfigAssetAmount(baseToAsset(runeAmountToWithdraw)),
              decimal: THORCHAIN_DECIMAL,
              trimZeros: true
            })}
          </Styled.OutputLabel>
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(AssetRuneNative, selectedPriceAsset) && (
            <Styled.OutputUSDLabel>
              {formatAssetAmountCurrency({
                amount: getTwoSigfigAssetAmount(
                  baseToAsset(baseAmount(runeAmountToWithdraw.amount().times(runePrice), THORCHAIN_DECIMAL))
                ),
                asset: selectedPriceAsset,
                trimZeros: true
              })}
            </Styled.OutputUSDLabel>
          )}
        </Styled.OutputContainer>
      </Styled.AssetOutputContainer>

      <Styled.AssetOutputContainer>
        <TooltipAddress title={assetAddress}>
          <Styled.AssetContainer>
            <Styled.AssetIcon asset={asset} network={network} />
            <Styled.AssetLabel asset={asset} />
            {isLedgerWallet(assetWalletType) && (
              <Styled.WalletTypeLabel>{intl.formatMessage({ id: 'ledger.title' })}</Styled.WalletTypeLabel>
            )}
          </Styled.AssetContainer>
        </TooltipAddress>
        <Styled.OutputContainer>
          <Styled.OutputLabel>
            {formatAssetAmount({
              amount: getTwoSigfigAssetAmount(baseToAsset(assetAmountToWithdraw)),
              decimal: assetDecimal,
              trimZeros: true
            })}
            {/* show pricing if price asset is different only */}
            {!eqAsset.equals(asset, selectedPriceAsset) && (
              <Styled.OutputUSDLabel>
                {formatAssetAmountCurrency({
                  amount: getTwoSigfigAssetAmount(baseToAsset(assetPriceToWithdraw1e8)),
                  asset: selectedPriceAsset,
                  trimZeros: true
                })}
              </Styled.OutputUSDLabel>
            )}
          </Styled.OutputLabel>
        </Styled.OutputContainer>
      </Styled.AssetOutputContainer>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col>
          <Styled.FeeRow>
            <Fees fees={uiFeesRD} reloadFees={reloadFeesHandler} />
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>{renderInboundChainFeeError}</>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>
      <Styled.SubmitButtonWrapper>
        <Styled.SubmitButton sizevalue="xnormal" onClick={onSubmit} disabled={disabledSubmit}>
          {intl.formatMessage({ id: 'common.withdraw' })}
        </Styled.SubmitButton>
      </Styled.SubmitButtonWrapper>

      {showLedgerModal && (
        <LedgerConfirmationModal
          onSuccess={onSucceedLedgerModal}
          onClose={onCloseLedgerModal}
          visible={showLedgerModal}
          // we always sent withdraw tx using THORCHain only
          chain={THORChain}
          network={network}
          description={intl.formatMessage({ id: 'deposit.withdraw.ledger.sign' })}
        />
      )}

      {showPasswordModal && (
        <WalletPasswordConfirmationModal
          onSuccess={onSucceedPasswordModal}
          onClose={onClosePasswordModal}
          validatePassword$={validatePassword$}
        />
      )}
      {renderTxModal}
    </Styled.Container>
  )
}
