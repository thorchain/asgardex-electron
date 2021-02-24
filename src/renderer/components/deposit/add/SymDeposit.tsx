import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  AssetAmount,
  AssetRuneNative,
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

import { Network } from '../../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { isChainAsset } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { SymDepositMemo, DepositFeesRD, SymDepositState, SymDepositStateHandler } from '../../../services/chain/types'
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
import * as Helper from './Deposit.helper'
import * as Styled from './Deposit.style'

export type Props = {
  asset: Asset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetBalance: O.Option<BaseAmount>
  runeBalance: O.Option<BaseAmount>
  chainAssetBalance: O.Option<BaseAmount>
  poolAddress: O.Option<PoolAddress>
  memo: O.Option<SymDepositMemo>
  priceAsset?: Asset
  fees: DepositFeesRD
  reloadFees: (type: DepositType) => void
  reloadBalances: FP.Lazy<void>
  viewAssetTx: (txHash: string) => void
  viewRuneTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  assets?: Asset[]
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
  deposit$: SymDepositStateHandler
  network: Network
}

type SelectedInput = 'asset' | 'rune' | 'none'

export const SymDeposit: React.FC<Props> = (props) => {
  const {
    asset,
    assetPrice,
    runePrice,
    assetBalance: oAssetBalance,
    runeBalance: oRuneBalance,
    chainAssetBalance: oChainAssetBalance,
    memo: oMemo,
    poolAddress: oPoolAddress,
    viewAssetTx = (_) => {},
    viewRuneTx = (_) => {},
    validatePassword$,
    assets,
    priceAsset,
    reloadFees,
    reloadBalances = FP.constVoid,
    fees,
    onChangeAsset,
    disabled = false,
    poolData,
    deposit$,
    network
  } = props

  const intl = useIntl()
  const [runeAmountToDeposit, setRuneAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToDeposit, setAssetAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToDeposit, setPercentValueToDeposit] = useState(0)
  const [selectedInput, setSelectedInput] = useState<SelectedInput>('none')

  const {
    state: depositState,
    reset: resetDepositState,
    subscribe: subscribeDepositState
  } = useSubscriptionState<SymDepositState>(INITIAL_SYM_DEPOSIT_STATE)

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

  const runeBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneBalance]
  )

  const oThorchainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.chain(({ thor }) => thor)
      ),
    [fees]
  )

  const maxRuneAmountToDeposit = useMemo((): BaseAmount => {
    const maxAmount = Helper.maxRuneAmountToDeposit({ poolData, runeBalance, assetBalance })

    // Consider fees
    return FP.pipe(
      oThorchainFee,
      // Check: maxAmount > fee
      O.filter((fee) => maxAmount.amount().isGreaterThan(fee.amount())),
      // Substract fee from maxAmount
      O.map((fee) => maxAmount.amount().minus(fee.amount())),
      // Set maxAmount to zero as long as we dont have a feeRate
      O.getOrElse(() => ZERO_BN),
      baseAmount
    )
  }, [assetBalance, oThorchainFee, poolData, runeBalance])

  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ asset }) => asset)
      ),
    [fees]
  )

  const maxAssetAmountToDeposit = useMemo((): BaseAmount => {
    const maxAmount = Helper.maxAssetAmountToDeposit({ poolData, runeBalance, assetBalance })
    // substract fees if needed
    if (isChainAsset(asset)) {
      return FP.pipe(
        oAssetChainFee,
        // Check: maxAmount > fee
        O.filter((fee) => maxAmount.amount().isGreaterThan(fee.amount())),
        // Substract fee from maxAmount
        O.map((fee) => maxAmount.amount().minus(fee.amount())),
        // Set maxAmount to zero as long as we dont have a feeRate
        O.getOrElse(() => ZERO_BN),
        baseAmount
      )
    }
    return maxAmount
  }, [asset, assetBalance, oAssetChainFee, poolData, runeBalance])

  const hasAssetBalance = useMemo(() => assetBalance.amount().isGreaterThan(0), [assetBalance])
  const hasRuneBalance = useMemo(() => runeBalance.amount().isGreaterThan(0), [runeBalance])

  const isBalanceError = useMemo(() => !hasAssetBalance && !hasRuneBalance, [hasAssetBalance, hasRuneBalance])

  const showBalanceError = useMemo(
    () =>
      // Note:
      // To avoid flickering of balance error for a short time at the beginning
      // We never show error if balances are not available
      O.isSome(oAssetBalance) && isBalanceError,
    [isBalanceError, oAssetBalance]
  )

  const renderBalanceError = useMemo(() => {
    const noAssetBalancesMsg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance1' },
      {
        asset: asset.ticker
      }
    )

    const noRuneBalancesMsg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance1' },
      {
        asset: AssetRuneNative.ticker
      }
    )

    const noRuneAndAssetBalancesMsg = intl.formatMessage(
      { id: 'deposit.add.error.nobalance2' },
      {
        asset1: asset.ticker,
        asset2: AssetRuneNative.ticker
      }
    )

    // asym error message
    const msg =
      // no balance for pool asset and rune
      !hasAssetBalance && !hasRuneBalance
        ? noRuneAndAssetBalancesMsg
        : // no rune balance
        !hasRuneBalance
        ? noRuneBalancesMsg
        : // no balance of pool asset
          noAssetBalancesMsg

    const title = intl.formatMessage({ id: 'deposit.add.error.nobalances' })

    return <Styled.BalanceAlert type="warning" message={title} description={msg} />
  }, [asset.ticker, hasAssetBalance, hasRuneBalance, intl])

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      // Do nothing if we don't entered input for rune
      if (selectedInput !== 'rune') return

      let runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToDeposit.amount())
        ? { ...maxRuneAmountToDeposit } // Use copy to avoid missmatch with values in input fields
        : runeInput
      const assetQuantity = Helper.getAssetAmountToDeposit(runeQuantity, poolData)

      if (assetQuantity.amount().isGreaterThan(maxAssetAmountToDeposit.amount())) {
        runeQuantity = Helper.getRuneAmountToDeposit(maxAssetAmountToDeposit, poolData)
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(maxAssetAmountToDeposit)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(assetQuantity)
        // formula: runeQuantity * 100 / maxRuneAmountToDeposit
        const percentToDeposit = maxRuneAmountToDeposit.amount().isGreaterThan(0)
          ? runeQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToDeposit.amount()).toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [maxAssetAmountToDeposit, maxRuneAmountToDeposit, poolData, selectedInput]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      // Do nothing if we don't entered input for asset
      if (selectedInput !== 'asset') return

      let assetQuantity = assetInput.amount().isGreaterThan(maxAssetAmountToDeposit.amount())
        ? { ...maxAssetAmountToDeposit } // Use copy to avoid missmatch with values in input fields
        : assetInput
      const runeQuantity = Helper.getRuneAmountToDeposit(assetQuantity, poolData)

      if (runeQuantity.amount().isGreaterThan(maxRuneAmountToDeposit.amount())) {
        assetQuantity = Helper.getAssetAmountToDeposit(runeQuantity, poolData)
        setRuneAmountToDeposit(maxRuneAmountToDeposit)
        setAssetAmountToDeposit(assetQuantity)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(assetQuantity)
        // assetQuantity * 100 / maxAssetAmountToDeposit
        const percentToDeposit = maxAssetAmountToDeposit.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxAssetAmountToDeposit.amount()).toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [maxAssetAmountToDeposit, maxRuneAmountToDeposit, poolData, selectedInput]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const runeAmountBN = maxRuneAmountToDeposit.amount().dividedBy(100).multipliedBy(percent)
      const assetAmountBN = maxAssetAmountToDeposit.amount().dividedBy(100).multipliedBy(percent)
      setRuneAmountToDeposit(baseAmount(runeAmountBN))
      setAssetAmountToDeposit(baseAmount(assetAmountBN))
      setPercentValueToDeposit(percent)
    },
    [maxAssetAmountToDeposit, maxRuneAmountToDeposit]
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

  const isThorchainFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oThorchainFee, oRuneBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oThorchainFee),
        ([fee, balance]) => balance.amount().isLessThan(fee.amount())
      )
    )
  }, [oRuneBalance, oThorchainFee])

  const renderThorchainFeeError = useMemo(() => {
    const amount = FP.pipe(
      oRuneBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oThorchainFee,
      O.map((fee) => renderFeeError(fee, amount, AssetRuneNative)),
      O.getOrElse(() => <></>)
    )
  }, [oRuneBalance, oThorchainFee, renderFeeError])

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

  const reloadFeesHandler = useCallback(() => reloadFees('sym'), [reloadFees])

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetSymbol: AssetRuneNative.symbol }),
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
        source={O.some({ asset: AssetRuneNative, amount: runeAmountToDeposit })}
        stepDescription={stepDescription}
        network={network}
      />
    )
  }, [intl, asset, depositState, assetAmountToDeposit, runeAmountToDeposit, network])

  const onFinishTxModal = useCallback(() => {
    resetDepositState()
    reloadBalances()
  }, [reloadBalances, resetDepositState])

  const renderTxModal = useMemo(() => {
    const { deposit: depositRD, depositTxs: symDepositTxs } = depositState

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

    const extraResult = (
      <Styled.ExtraContainer>
        {FP.pipe(symDepositTxs.rune, RD.toOption, (oTxHash) => (
          <Styled.ViewTxButtonTop
            txHash={oTxHash}
            onClick={viewRuneTx}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetSymbol: AssetRuneNative.symbol })}
          />
        ))}
        {FP.pipe(symDepositTxs.asset, RD.toOption, (oTxHash) => (
          <ViewTxButton
            txHash={oTxHash}
            onClick={viewAssetTx}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetSymbol: asset.symbol })}
          />
        ))}
      </Styled.ExtraContainer>
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={resetDepositState}
        onFinish={onFinishTxModal}
        startTime={depositStartTime}
        txRD={depositRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={txModalExtraContent}
      />
    )
  }, [
    depositState,
    resetDepositState,
    onFinishTxModal,
    depositStartTime,
    txModalExtraContent,
    intl,
    viewRuneTx,
    viewAssetTx,
    asset.symbol
  ])

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
      O.map((memos) => {
        subscribeDepositState(
          deposit$({
            asset,
            poolAddress: oPoolAddress,
            amounts: { rune: runeAmountToDeposit, asset: assetAmountToDeposit },
            memos
          })
        )

        return true
      })
    )
  }, [
    closePasswordModal,
    oMemo,
    subscribeDepositState,
    deposit$,
    asset,
    oPoolAddress,
    runeAmountToDeposit,
    assetAmountToDeposit
  ])

  const disabledForm = useMemo(() => isBalanceError || isThorchainFeeError || disabled, [
    disabled,
    isBalanceError,
    isThorchainFeeError
  ])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.map(({ asset: assetFeeAmount, thor: oThorFeeAmount }) => {
          const fees = [{ asset, amount: assetFeeAmount }]

          return FP.pipe(
            oThorFeeAmount,
            O.map((thorFeeAmount) => [...fees, { asset: AssetRuneNative, amount: thorFeeAmount }]),
            O.getOrElse(() => fees)
          )
        })
      ),
    [asset, fees]
  )

  return (
    <Styled.Container>
      {showBalanceError && (
        <Styled.BalanceErrorRow>
          <Col xs={24}>{showBalanceError && renderBalanceError}</Col>
        </Styled.BalanceErrorRow>
      )}
      <Styled.CardsRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.AssetCard
            disabled={disabledForm}
            asset={asset}
            selectedAmount={assetAmountToDeposit}
            maxAmount={maxAssetAmountToDeposit}
            onChangeAssetAmount={assetAmountChangeHandler}
            inputOnFocusHandler={() => setSelectedInput('asset')}
            inputOnBlurHandler={() => setSelectedInput('none')}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToDeposit}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAsset}
            priceAsset={priceAsset}
            network={network}
          />
        </Col>

        <Col xs={24} xl={12}>
          <Styled.AssetCard
            disabled={disabledForm}
            asset={AssetRuneNative}
            selectedAmount={runeAmountToDeposit}
            maxAmount={maxRuneAmountToDeposit}
            onChangeAssetAmount={runeAmountChangeHandler}
            inputOnFocusHandler={() => setSelectedInput('rune')}
            inputOnBlurHandler={() => setSelectedInput('none')}
            price={runePrice}
            priceAsset={priceAsset}
            network={network}
          />
        </Col>
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
                  // Don't show thorchain fee error if we already display a error of balances
                  !isBalanceError && isThorchainFeeError && renderThorchainFeeError
                }
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
          disabled={disabledForm || runeAmountToDeposit.amount().isZero()}
          network={network}
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
