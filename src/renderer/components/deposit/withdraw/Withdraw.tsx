import React, { useState, useMemo, useCallback, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getWithdrawMemo } from '@thorchain/asgardex-util'
import {
  Asset,
  AssetRuneNative,
  baseAmount,
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
import { FeeLD, FeeRD, Memo, WithdrawState, WithdrawStateHandler } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { PasswordModal } from '../../modal/password'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { Fees, UIFeesRD } from '../../uielements/fees'
import { Label } from '../../uielements/label'
import { getWithdrawAmounts } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

export type Props = {
  /** Asset to withdraw */
  asset: Asset
  /** Rune price */
  runePrice: BigNumber
  /** Asset price */
  assetPrice: BigNumber
  /** Wallet balance of Rune */
  runeBalance: O.Option<BaseAmount>
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to reload fees */
  reloadFees: (chain: Chain) => void
  /** Share of Rune and of selected Asset */
  shares: { rune: BaseAmount; asset: BaseAmount }
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  poolAddress: O.Option<PoolAddress>
  viewRuneTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadBalances: FP.Lazy<void>
  withdraw$: WithdrawStateHandler
  fee$: (chain: Chain, memo: Memo) => FeeLD
  network: Network
}

/**
 * Withdraw component
 *
 * Note: It currently supports sym. withdraw only
 *
 * */
export const Withdraw: React.FC<Props> = ({
  asset,
  runePrice,
  assetPrice,
  runeBalance: oRuneBalance,
  selectedPriceAsset,
  shares: { rune: runeShare, asset: assetShare },
  disabled,
  poolAddress: oPoolAddress,
  viewRuneTx = (_) => {},
  validatePassword$,
  reloadBalances = FP.constVoid,
  reloadFees,
  withdraw$,
  fee$,
  network
}) => {
  const intl = useIntl()

  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  // For a WITHDRAW memo percent needs to be multiplied by 100 to transform it into "points" (needed by `getWithdrawMemo`)
  const memo = useMemo(() => getWithdrawMemo(asset, withdrawPercent * 100), [asset, withdrawPercent])

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

  // TODO (@Veado) Use following logic for asym. withdraw only (see https://github.com/thorchain/asgardex-electron/issues/827)
  // For sym. withdraw we do need to get fees only once (THORChain tx fee does not depend on memo)
  const feeLD: FeeLD = useMemo(() => {
    return Rx.of(memo).pipe(
      // Memo depends on changing `withdrawPercent`
      // that's why we delay it to avoid many requests for fees
      RxOp.delay(800),
      // Currently we send Rune txs only - it will be changed as soon as we support asym. withdraw
      RxOp.switchMap((_) => fee$(AssetRuneNative.chain, memo))
    )
  }, [fee$, memo])

  const feeRD: FeeRD = useObservableState(feeLD, RD.initial)
  const oFee: O.Option<BaseAmount> = useMemo(() => RD.toOption(feeRD), [feeRD])

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

    const runeBalance = FP.pipe(
      oRuneBalance,
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
      }),
      O.getOrElse(() => <></>)
    )
  }, [isFeeError, oRuneBalance, oFee, intl])

  // Deposit start time
  const [depositStartTime, setDepositStartTime] = useState<number>(0)

  // Withdraw state
  const [withdrawState, setWithdrawState] = useState<WithdrawState>(INITIAL_WITHDRAW_STATE)

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetSymbol: AssetRuneNative.symbol }),
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
            onClick={viewRuneTx}
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
  }, [withdrawState, onCloseTxModal, onFinishTxModal, depositStartTime, txModalExtraContent, intl, viewRuneTx])

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

    const sub = withdraw$({
      // TODO @veado Use asset for asym withdraw - see https://github.com/thorchain/asgardex-electron/issues/827
      asset: AssetRuneNative,
      poolAddress: oPoolAddress,
      network,
      memo
    }).subscribe(setWithdrawState)

    // store subscription - needed to unsubscribe while unmounting
    setWithdrawSub(O.some(sub))
  }, [closePasswordModal, withdraw$, oPoolAddress, network, memo, setWithdrawSub])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: AssetRuneNative, amount: fee }])
      ),
    [feeRD]
  )

  const reloadFeesHandler = useCallback(() => reloadFees(AssetRuneNative.chain), [reloadFees])

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
        disabled={disabled}
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
              amount: baseToAsset(baseAmount(runeAmountToWithdraw.amount().times(runePrice))),
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

      <Styled.Drag
        title={intl.formatMessage({ id: 'deposit.withdraw.drag' })}
        onConfirm={() => setShowPasswordModal(true)}
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
