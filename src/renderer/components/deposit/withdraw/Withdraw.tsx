import React, { useState, useMemo, useCallback, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  assetAmount,
  AssetRuneNative,
  BaseAmount,
  baseToAsset,
  Chain,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
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
import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { FeeLD, FeeRD, WithdrawState, WithdrawStateHandler } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { PasswordModal } from '../../modal/password'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { Label } from '../../uielements/label'
import { getWithdrawAmounts } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

export type Props = {
  /** Asset to withdraw */
  asset: Asset
  /** Rune price */
  runePrice: BigNumber
  /** Asset based `PoolData` */
  assetPoolData: PoolData
  /** Asset price */
  assetPrice: BigNumber
  /** `PoolData` of assets chain asset */
  chainAssetPoolData: PoolData
  /** Wallet balance of Rune */
  runeBalance: O.Option<BaseAmount>
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to send withdraw tx */
  onWithdraw: (percent: number) => void
  /** Callback to reload fees */
  reloadFees: () => void
  /** Share of Rune and of selected Asset */
  shares: { rune: BaseAmount; asset: BaseAmount }
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  poolAddress: O.Option<PoolAddress>
  viewTx: (txHash: string, chain: Chain) => void
  validatePassword$: ValidatePasswordHandler
  reloadBalances: FP.Lazy<void>
  withdraw$: WithdrawStateHandler
  fee$: (asset: Asset, percent: number) => FeeLD
  network: Network
}

export const Withdraw: React.FC<Props> = ({
  asset,
  assetPoolData,
  onWithdraw,
  runePrice,
  assetPrice,
  chainAssetPoolData,
  runeBalance: oRuneBalance,
  selectedPriceAsset,
  shares: { rune: runeShare, asset: assetShare },
  disabled,
  poolAddress: oPoolAddress,
  viewTx = (_) => {},
  validatePassword$,
  reloadBalances = FP.constVoid,
  reloadFees,
  withdraw$,
  fee$,
  network
}) => {
  const intl = useIntl()

  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const { rune: runeAmountToWithdraw, asset: assetAmountToWithdraw } = getWithdrawAmounts(
    runeShare,
    assetShare,
    withdrawPercent
  )

  // (Possible) subscription of `withdraw$`
  // DON'T use `_setWithdrawSub` to update state (it's unsafe) - use `setWithdrawSub`!!
  const [withdrawSub, _setWithdrawSub] = useState<O.Option<Rx.Subscription>>(O.none)

  // unsubscribe withdraw$ subscription
  const unsubscribeWithdrawSub = useCallback(() => {
    FP.pipe(
      withdrawSub,
      O.map((sub) => sub.unsubscribe())
    )
  }, [withdrawSub])

  const setWithdrawSub = useCallback(
    (state) => {
      unsubscribeWithdrawSub()
      _setWithdrawSub(state)
    },
    [unsubscribeWithdrawSub]
  )

  useEffect(() => {
    // Unsubscribe of (possible) previous subscription of `withdraw$`
    return () => {
      unsubscribeWithdrawSub()
    }
  }, [unsubscribeWithdrawSub])

  // Currently we do sent WITHDRAW by using NativeRune only
  // It will be changed as soon as we support asymmetrical withdraw
  // and it should be always an asset with smallest amount to sent a non-zero tx
  const txAsset: Asset = AssetRuneNative

  const txAssetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneBalance]
  )

  const feeLD: FeeLD = useMemo(
    () =>
      Rx.of(withdrawPercent).pipe(
        RxOp.debounceTime(1000),
        // Currently we do sent WITHDRAW by using NativeRune only
        // It might be changed as soon as we support asymmetrical withdraw
        RxOp.switchMap((_) => fee$(txAsset, withdrawPercent))
      ),
    [txAsset, fee$, withdrawPercent]
  )

  const feeRD: FeeRD = useObservableState(feeLD, RD.initial)
  const oFee: O.Option<BaseAmount> = useMemo(() => RD.toOption(feeRD), [feeRD])

  // Deposit start time
  const [depositStartTime, setDepositStartTime] = useState<number>(0)

  // Withdraw state
  const [withdrawState, setWithdrawState] = useState<WithdrawState>(INITIAL_WITHDRAW_STATE)

  const isFeeError: boolean = useMemo(() => {
    if (withdrawPercent <= 0) return false

    return FP.pipe(
      sequenceTOption(oFee, oRuneBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oFee, oRuneBalance, withdrawPercent])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    return FP.pipe(
      oFee,
      O.map((fee) => {
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.error.feeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset: txAsset,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({ amount: baseToAsset(txAssetBalance), asset: txAsset, trimZeros: true })
          }
        )
        return <Styled.FeeErrorLabel key="fee-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [isFeeError, oFee, intl, txAsset, txAssetBalance])

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetSymbol: AssetRuneNative.symbol }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetSymbol: asset.symbol }),
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
      />
    )
  }, [intl, asset, withdrawState, assetAmountToWithdraw, runeAmountToWithdraw])

  const onCloseTxModal = useCallback(() => {
    // unsubscribe
    unsubscribeWithdrawSub()
    // reset withdraw$ subscription
    setWithdrawSub(O.none)
    // reset deposit state
    setWithdrawState(INITIAL_WITHDRAW_STATE)
  }, [setWithdrawSub, unsubscribeWithdrawSub])

  const onFinishTxModal = useCallback(() => {
    // Do same things as with closing
    onCloseTxModal()
    // but also refresh balances
    reloadBalances()
  }, [onCloseTxModal, reloadBalances])

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
            onClick={viewTx}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetSymbol: AssetRuneNative.symbol })}
          />
        ))}
      </Styled.ExtraContainer>
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={onCloseTxModal}
        onFinish={onFinishTxModal}
        startTime={depositStartTime}
        txRD={withdrawRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={txModalExtraContent}
      />
    )
  }, [withdrawState, txModalExtraContent, onCloseTxModal, onFinishTxModal, depositStartTime, intl])

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

    // set start time
    setDepositStartTime(Date.now())

    FP.pipe(
      oMemo,
      O.map((memo) => {
        const sub = withdraw$({
          asset,
          poolAddress: oPoolAddress,
          network,
          memo
        }).subscribe(setWithdrawState)

        // store subscription - needed to unsubscribe while unmounting
        setWithdrawSub(O.some(sub))

        return true
      })
    )
  }, [closePasswordModal, withdraw$, asset, oPoolAddress, network, setWithdrawSub])

  const disabledForm = useMemo(() => withdrawPercent <= 0 || disabled, [withdrawPercent, disabled])

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'deposit.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'deposit.withdraw.choseText' })}</Label>

      <Styled.Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        disabled={false}
      />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'deposit.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={AssetRuneNative} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: baseToAsset(runeAmountToWithdraw),
            asset: AssetRuneNative,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(AssetRuneNative, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(runeAmountToWithdraw.amount().times(runePrice)),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={asset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: baseToAsset(assetAmountToWithdraw),
            asset: asset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(asset, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(assetAmountToWithdraw.amount().times(assetPrice)),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col>
          <Styled.FeeRow>{/* TODO (@Veado) Use Fees component */}</Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>{renderFeeError}</>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>

      <Styled.Drag
        title={intl.formatMessage({ id: 'deposit.withdraw.drag' })}
        onConfirm={() => onWithdraw(withdrawPercent)}
        disabled={disabledForm}
      />
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
