import React, { useState, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getWithdrawMemo } from '@thorchain/asgardex-util'
import { Asset, baseAmount, BaseAmount, baseToAsset, Chain, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { eqAsset } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { FeeLD, FeeRD, Memo, WithdrawState, AsymWithdrawStateHandler } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { PasswordModal } from '../../modal/password'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { Fees, UIFeesRD } from '../../uielements/fees'
import { Label } from '../../uielements/label'
import { getAsymWithdrawAmount } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

export type Props = {
  /** Asset to withdraw */
  asset: Asset
  /** Rune price (base amount) */
  runePrice: BigNumber
  /** Asset price (base amount) */
  assetPrice: BigNumber
  /** Wallet balance of chain asset */
  chainAssetBalance: O.Option<BaseAmount>
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to reload fees */
  reloadFees: (chain: Chain) => void
  /** Share of Asset */
  share: BaseAmount
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  poolAddresses: O.Option<PoolAddress>
  viewRuneTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadBalances: FP.Lazy<void>
  withdraw$: AsymWithdrawStateHandler
  fee$: (chain: Chain, memo: Memo) => FeeLD
  network: Network
}

/**
 * AsymWithdraw component
 *
 * Note: It currently supports asym deposits for paired asset only (but not for RUNE)
 */
export const AsymWithdraw: React.FC<Props> = ({
  asset,
  assetPrice,
  chainAssetBalance: oChainAssetBalance,
  selectedPriceAsset,
  share,
  disabled,
  poolAddresses: oPoolAddresses,
  viewRuneTx = (_) => {},
  validatePassword$,
  reloadBalances = FP.constVoid,
  reloadFees,
  withdraw$,
  fee$,
  network
}) => {
  const intl = useIntl()

  const {
    state: withdrawState,
    reset: resetWithdrawState,
    subscribe: subscribeWithdrawState
  } = useSubscriptionState<WithdrawState>(INITIAL_WITHDRAW_STATE)

  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const memo = useMemo(() => getWithdrawMemo({ asset, percent: withdrawPercent }), [asset, withdrawPercent])

  const feeLD: FeeLD = useMemo(() => {
    return Rx.of(memo).pipe(
      // Memo depends on changing `withdrawPercent`
      // that's why we delay it to avoid many requests for fees
      RxOp.delay(800),
      RxOp.switchMap((_) => fee$(asset.chain, memo))
    )
  }, [asset, fee$, memo])

  const feeRD: FeeRD = useObservableState(feeLD, RD.initial)
  const oFee: O.Option<BaseAmount> = useMemo(() => RD.toOption(feeRD), [feeRD])

  const isFeeError: boolean = useMemo(() => {
    if (withdrawPercent <= 0) return false

    return FP.pipe(
      sequenceTOption(oFee, oChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oFee, oChainAssetBalance, withdrawPercent])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const chainAssetBalance = FP.pipe(
      oChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )

    return FP.pipe(
      oFee,
      O.map((fee) => {
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.error.feeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset: asset,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({
              amount: baseToAsset(chainAssetBalance),
              asset: asset,
              trimZeros: true
            })
          }
        )
        return <Styled.FeeErrorLabel key="fee-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [isFeeError, oChainAssetBalance, oFee, intl, asset])

  const assetAmountToWithdraw = getAsymWithdrawAmount({ share, percent: withdrawPercent, fee: oFee })

  // Withdraw start time
  const [withdrawStartTime, setWithdrawStartTime] = useState<number>(0)

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: asset.ticker }),
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
        source={O.none}
        stepDescription={stepDescription}
        network={network}
      />
    )
  }, [
    intl,
    asset,
    withdrawState.withdraw,
    withdrawState.step,
    withdrawState.stepsTotal,
    assetAmountToWithdraw,
    network
  ])

  const onFinishTxModal = useCallback(() => {
    resetWithdrawState()
    reloadBalances()
  }, [reloadBalances, resetWithdrawState])

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
            onClick={viewRuneTx}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: asset.ticker })}
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
    viewRuneTx,
    asset.ticker
  ])

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const closePasswordModal = useCallback(() => {
    setShowPasswordModal(false)
  }, [setShowPasswordModal])

  const onClosePasswordModal = useCallback(() => {
    // close password modal
    closePasswordModal()
  }, [closePasswordModal])

  const onSucceedPasswordModal = useCallback(() => {
    // close private modal
    closePasswordModal()

    FP.pipe(
      oPoolAddresses,
      O.map((poolAddresses) => {
        // set start time
        setWithdrawStartTime(Date.now())

        subscribeWithdrawState(
          withdraw$({
            asset,
            poolAddress: poolAddresses,
            network,
            memo
          })
        )

        return true
      })
    )
  }, [closePasswordModal, oPoolAddresses, subscribeWithdrawState, withdraw$, asset, network, memo])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset, amount: fee }])
      ),
    [asset, feeRD]
  )

  const reloadFeesHandler = useCallback(() => reloadFees(asset.chain), [asset, reloadFees])

  const disabledForm = useMemo(() => withdrawPercent <= 0 || disabled, [withdrawPercent, disabled])

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'deposit.withdraw.asym.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'deposit.withdraw.choseText' })}</Label>

      <Styled.Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        disabled={disabled}
      />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'deposit.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={asset} network={network} />
        <Styled.AssetLabel asset={asset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: baseToAsset(assetAmountToWithdraw),
            asset: asset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(asset, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: baseToAsset(baseAmount(assetAmountToWithdraw.amount().times(assetPrice))),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col>
          <Styled.FeeRow>
            <Fees fees={uiFeesRD} reloadFees={reloadFeesHandler} />
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>{renderFeeError}</>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>
      <Styled.SubmitButtonWrapper>
        <Styled.SubmitButton sizevalue="big" onClick={() => setShowPasswordModal(true)} disabled={disabledForm}>
          {intl.formatMessage({ id: 'common.withdraw' })}
        </Styled.SubmitButton>
      </Styled.SubmitButtonWrapper>
      {showPasswordModal && (
        <PasswordModal
          onSuccess={onSucceedPasswordModal}
          onClose={onClosePasswordModal}
          validatePassword$={validatePassword$}
        />
      )}
      {renderTxModal}
    </Styled.Container>
  )
}
