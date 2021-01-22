import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  AssetAmount,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { isChainAsset } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { INITIAL_ASYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { Memo, DepositFeesRD, AsymDepositState, AsymDepositStateHandler } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { DepositType } from '../../../types/asgardex'
import { PasswordModal } from '../../modal/password'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { ViewTxButton } from '../../uielements/button'
import { Drag } from '../../uielements/drag'
import { Fees, UIFeesRD } from '../../uielements/fees'
import { formatFee } from '../../uielements/fees/Fees.helper'
import * as Styled from './Deposit.style'

export type Props = {
  asset: Asset
  assetPrice: BigNumber
  assetBalance: O.Option<BaseAmount>
  chainAssetBalance: O.Option<BaseAmount>
  poolAddress: O.Option<PoolAddress>
  memo: O.Option<Memo>
  priceAsset?: Asset
  fees: DepositFeesRD
  reloadFees: (type: DepositType) => void
  reloadBalances: FP.Lazy<void>
  viewAssetTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  assets?: Asset[]
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
  deposit$: AsymDepositStateHandler
}

export const AsymDeposit: React.FC<Props> = (props) => {
  const {
    asset,
    assetPrice,
    assetBalance: oAssetBalance,
    chainAssetBalance: oChainAssetBalance,
    memo: oMemo,
    poolAddress: oPoolAddress,
    viewAssetTx = (_) => {},
    validatePassword$,
    assets,
    priceAsset,
    reloadFees,
    reloadBalances = FP.constVoid,
    fees,
    onChangeAsset,
    disabled = false,
    deposit$
  } = props

  const intl = useIntl()
  const [assetAmountToDeposit, setAssetAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToDeposit, setPercentValueToDeposit] = useState(0)

  // (Possible) subscription of `xyzDeposit$`
  // DON'T use `_setDepositSubUnsafe` to update state (it's unsafe) - use `setDepositSub`!!
  const [depositSub, _setDepositSub] = useState<O.Option<Rx.Subscription>>(O.none)

  // unsubscribe deposit$ subscription
  const unsubscribeDepositSub = useCallback(() => {
    FP.pipe(
      depositSub,
      O.map((sub) => sub.unsubscribe())
    )
  }, [depositSub])

  const setDepositSub = useCallback(
    (state) => {
      unsubscribeDepositSub()
      _setDepositSub(state)
    },
    [unsubscribeDepositSub]
  )

  useEffect(() => {
    // Unsubscribe of (possible) previous subscription of `deposit$`
    return () => {
      unsubscribeDepositSub()
    }
  }, [unsubscribeDepositSub])

  // Deposit state
  const [depositState, setDepositState] = useState<AsymDepositState>(INITIAL_ASYM_DEPOSIT_STATE)

  // Deposit start time
  const [depositStartTime, setDepositStartTime] = useState<number>(0)

  const assetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oAssetBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oAssetBalance]
  )

  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ asset }) => asset)
      ),
    [fees]
  )

  const maxAssetAmountToDeposit: BaseAmount = useMemo(() => {
    // substract fees if needed
    if (isChainAsset(asset)) {
      return FP.pipe(
        sequenceTOption(oAssetChainFee, oAssetBalance),
        // Check: maxAmount > fee
        O.filter(([fee]) => assetBalance.amount().isGreaterThan(fee.amount())),
        // Substract fee from balance
        O.map(([fee, balance]) => balance.amount().minus(fee.amount())),
        // Set maxAmount to zero as long as we dont have a feeRate
        O.getOrElse(() => ZERO_BN),
        baseAmount
      )
    }
    // or return asset balances w/o any restriction
    return assetBalance
  }, [asset, assetBalance, oAssetBalance, oAssetChainFee])

  const hasAssetBalance = useMemo(() => assetBalance.amount().isGreaterThan(0), [assetBalance])

  const isBalanceError = useMemo(() => !hasAssetBalance, [hasAssetBalance])

  const showBalanceError = useMemo(
    () =>
      // Note:
      // To avoid flickering of balance error for a short time at the beginning
      // We never show error if balances are not available
      FP.pipe(oAssetBalance, (balances) => O.isSome(balances) && isBalanceError),
    [isBalanceError, oAssetBalance]
  )

  const renderBalanceError = useMemo(() => {
    const msg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance1' },
      {
        asset: asset.ticker
      }
    )

    const title = intl.formatMessage({ id: 'deposit.add.error.nobalances' })

    return <Styled.BalanceAlert type="warning" message={title} description={msg} />
  }, [asset.ticker, intl])

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      // We don't accept more that `maxAssetAmountToDeposit`
      const value = assetInput.amount().isGreaterThan(maxAssetAmountToDeposit.amount())
        ? { ...maxAssetAmountToDeposit } // Use copy to avoid missmatch with values in input fields
        : assetInput
      setAssetAmountToDeposit(value)
      // assetQuantity * 100 / maxAssetAmountToDeposit
      const percentToDeposit = maxAssetAmountToDeposit.amount().isGreaterThan(0)
        ? value.amount().multipliedBy(100).dividedBy(maxAssetAmountToDeposit.amount()).toNumber()
        : 0
      setPercentValueToDeposit(percentToDeposit)
    },
    [maxAssetAmountToDeposit]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const assetAmountBN = maxAssetAmountToDeposit.amount().dividedBy(100).multipliedBy(percent)
      setAssetAmountToDeposit(baseAmount(assetAmountBN))
      setPercentValueToDeposit(percent)
    },
    [maxAssetAmountToDeposit]
  )

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const confirmDepositHandler = useCallback(() => {
    setShowPasswordModal(true)
  }, [setShowPasswordModal])

  const renderFeeError = useCallback(
    (fee: BaseAmount, balance: AssetAmount, asset: Asset) => {
      const msg = intl.formatMessage(
        { id: 'deposit.add.error.chainFeeNotCovered' },
        {
          fee: formatFee({ amount: fee, asset }),
          balance: formatAssetAmountCurrency({ amount: balance, asset, trimZeros: true })
        }
      )

      return <Styled.FeeErrorLabel>{msg}</Styled.FeeErrorLabel>
    },
    [intl]
  )

  const isAssetChainFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oAssetChainFee, oChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oAssetChainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oAssetChainFee, oChainAssetBalance])

  const renderAssetChainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oAssetChainFee,
      O.map((fee) => renderFeeError(fee, amount, asset)),
      O.getOrElse(() => <></>)
    )
  }, [oChainAssetBalance, oAssetChainFee, renderFeeError, asset])

  const reloadFeesHandler = useCallback(() => reloadFees('asym'), [reloadFees])

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetSymbol: asset.symbol }),
      intl.formatMessage({ id: 'common.tx.checkResult' })
    ]
    const stepDescription = FP.pipe(
      depositState.deposit,
      RD.fold(
        () => '',
        () =>
          `${intl.formatMessage(
            { id: 'common.step' },
            { current: depositState.step, total: depositState.stepsTotal }
          )}: ${stepDescriptions[depositState.step - 1]}`,
        () => '',
        () => `${intl.formatMessage({ id: 'common.done' })}!`
      )
    )

    return (
      <DepositAssets
        target={{ asset, amount: assetAmountToDeposit }}
        source={O.none}
        stepDescription={stepDescription}
      />
    )
  }, [intl, asset, depositState, assetAmountToDeposit])

  const onCloseTxModal = useCallback(() => {
    // unsubscribe
    unsubscribeDepositSub()
    // reset deposit$ subscription
    setDepositSub(O.none)
    // reset deposit states
    setDepositState(INITIAL_ASYM_DEPOSIT_STATE)
  }, [setDepositSub, unsubscribeDepositSub])

  const onFinishTxModal = useCallback(() => {
    // Do same things as with closing
    onCloseTxModal()
    // but also refresh balances
    reloadBalances()
  }, [onCloseTxModal, reloadBalances])

  const renderTxModal = useMemo(() => {
    const { deposit: depositRD, depositTx: asymDepositTx } = depositState

    // don't render TxModal in initial state
    if (RD.isInitial(depositRD)) return <></>

    // Get timer value
    const timerValue = FP.pipe(
      depositRD,
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
      depositRD,
      RD.fold(
        () => 'deposit.add.state.pending',
        () => 'deposit.add.state.pending',
        () => 'deposit.add.state.error',
        () => 'deposit.add.state.success'
      ),
      (id) => intl.formatMessage({ id })
    )

    const extraResult = <ViewTxButton txHash={RD.toOption(asymDepositTx)} onClick={viewAssetTx} />

    return (
      <TxModal
        title={txModalTitle}
        onClose={onCloseTxModal}
        onFinish={onFinishTxModal}
        startTime={depositStartTime}
        txRD={depositRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={txModalExtraContent}
      />
    )
  }, [depositState, viewAssetTx, txModalExtraContent, onCloseTxModal, onFinishTxModal, depositStartTime, intl])

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
        const sub = deposit$({
          asset,
          poolAddress: oPoolAddress,
          amount: assetAmountToDeposit,
          memo
        }).subscribe(setDepositState)

        // store subscription - needed to unsubscribe while unmounting
        setDepositSub(O.some(sub))

        return true
      })
    )
  }, [closePasswordModal, oMemo, deposit$, asset, oPoolAddress, assetAmountToDeposit, setDepositSub])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.map(({ asset: assetFeeAmount }) => [{ asset, amount: assetFeeAmount }])
      ),
    [asset, fees]
  )

  const disabledForm = useMemo(() => isBalanceError || disabled, [disabled, isBalanceError])

  return (
    <Styled.Container>
      <Styled.BalanceErrorRow>
        <Col xs={24}>{showBalanceError && renderBalanceError}</Col>
      </Styled.BalanceErrorRow>
      <Styled.CardsRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.AssetCard
            disabled={disabledForm}
            asset={asset}
            selectedAmount={assetAmountToDeposit}
            maxAmount={maxAssetAmountToDeposit}
            onChangeAssetAmount={assetAmountChangeHandler}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToDeposit}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAsset}
            priceAsset={priceAsset}
          />
        </Col>
        <Col xs={24} xl={12}></Col>
      </Styled.CardsRow>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.FeeRow>
            <Fees fees={uiFeesRD} reloadFees={reloadFeesHandler} />
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>
                {
                  // Don't show asset chain fee error if we already display a error of balances
                  !isBalanceError && isAssetChainFeeError && renderAssetChainFeeError
                }
              </>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>

      <Styled.DragWrapper>
        <Drag
          title={intl.formatMessage({ id: 'deposit.drag' })}
          onConfirm={confirmDepositHandler}
          disabled={disabledForm}
        />
      </Styled.DragWrapper>
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
