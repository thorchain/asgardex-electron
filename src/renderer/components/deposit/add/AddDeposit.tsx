import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
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
import * as Rx from 'rxjs'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { INITIAL_ASYM_DEPOSIT_STATE, INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import {
  SymDepositMemo,
  Memo,
  SendDepositTxParams,
  DepositFeesRD,
  AsymDepositState,
  AsymDepositStateHandler,
  SymDepositState,
  SymDepositStateHandler
} from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { DepositType } from '../../../types/asgardex'
import { PasswordModal } from '../../modal/password'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { ViewTxButton } from '../../uielements/button'
import { Drag } from '../../uielements/drag'
import { formatFee } from '../../uielements/fees/Fees.helper'
import * as Helper from './AddDeposit.helper'
import * as Styled from './AddDeposit.style'

export type Props = {
  type: DepositType
  asset: Asset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetBalance: O.Option<BaseAmount>
  runeBalance: O.Option<BaseAmount>
  chainAssetBalance: O.Option<BaseAmount>
  poolAddress: O.Option<PoolAddress>
  asymDepositMemo: O.Option<Memo>
  symDepositMemo: O.Option<SymDepositMemo>
  priceAsset?: Asset
  fees: DepositFeesRD
  reloadFees: (type: DepositType) => void
  reloadBalances: FP.Lazy<void>
  viewAssetTx: (txHash: string) => void
  viewRuneTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  assets?: Asset[]
  onDeposit: (p: SendDepositTxParams) => void
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
  asymDeposit$: AsymDepositStateHandler
  symDeposit$: SymDepositStateHandler
}

export const AddDeposit: React.FC<Props> = (props) => {
  const {
    type,
    asset,
    assetPrice,
    runePrice,
    assetBalance: oAssetBalance,
    runeBalance: oRuneBalance,
    chainAssetBalance: oChainAssetBalance,
    asymDepositMemo: oAsymDepositMemo,
    symDepositMemo: oSymDepositMemo,
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
    asymDeposit$,
    symDeposit$
  } = props

  const intl = useIntl()
  const [runeAmountToDeposit, setRuneAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToDeposit, setAssetAmountToDeposit] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToDeposit, setPercentValueToDeposit] = useState(0)

  const isAsym = useMemo(() => type === 'asym', [type])

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
    // Unsubscribe of (possible) previous subscription of `swap$`
    return () => {
      unsubscribeDepositSub()
    }
  }, [unsubscribeDepositSub])

  // Deposit states
  const [asymDepositState, setAsymDepositState] = useState<AsymDepositState>(INITIAL_ASYM_DEPOSIT_STATE)
  const [symDepositState, setSymDepositState] = useState<SymDepositState>(INITIAL_SYM_DEPOSIT_STATE)

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

  const maxRuneAmountToDeposit = useMemo(
    (): BaseAmount => Helper.maxRuneAmountToDeposit({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const maxAssetAmountToDeposit = useMemo(
    (): BaseAmount => Helper.maxAssetAmountToDeposit({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const hasAssetBalance = useMemo(() => assetBalance.amount().isGreaterThan(0), [assetBalance])
  const hasRuneBalance = useMemo(() => runeBalance.amount().isGreaterThan(0), [runeBalance])

  const isAsymBalanceError = useMemo(() => !hasAssetBalance, [hasAssetBalance])

  const isSymBalanceError = useMemo(() => !hasAssetBalance && !hasRuneBalance, [hasAssetBalance, hasRuneBalance])

  const isBalanceError = useMemo(() => (type === 'sym' ? isSymBalanceError : isAsymBalanceError), [
    isAsymBalanceError,
    isSymBalanceError,
    type
  ])

  const showBalanceError = useMemo(
    () =>
      // Note:
      // To avoid flickering of balance error for a short time at the beginning
      // We never show error if balances are not available
      type === 'sym'
        ? O.isSome(oAssetBalance) && isSymBalanceError
        : FP.pipe(sequenceTOption(oRuneBalance, oAssetBalance), (balances) => O.isSome(balances) && isAsymBalanceError),
    [isAsymBalanceError, isSymBalanceError, oAssetBalance, oRuneBalance, type]
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
    const asymMsg =
      // no balance for pool asset and rune
      !hasAssetBalance && !hasRuneBalance
        ? noRuneAndAssetBalancesMsg
        : // no rune balance
        !hasRuneBalance
        ? noRuneBalancesMsg
        : // no balance of pool asset
          noAssetBalancesMsg

    const symMsg = noAssetBalancesMsg

    const title = intl.formatMessage({ id: 'deposit.add.error.nobalances' })

    const msg = type === 'sym' ? symMsg : asymMsg
    return <Styled.BalanceAlert type="warning" message={title} description={msg} />
  }, [asset.ticker, hasAssetBalance, hasRuneBalance, intl, type])

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      let runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToDeposit.amount())
        ? maxRuneAmountToDeposit
        : runeInput
      const assetQuantity = Helper.getAssetAmountToDeposit(runeQuantity, poolData)

      if (assetQuantity.amount().isGreaterThan(maxRuneAmountToDeposit.amount())) {
        runeQuantity = Helper.getRuneAmountToDeposit(maxRuneAmountToDeposit, poolData)
        setRuneAmountToDeposit(runeQuantity)
        setAssetAmountToDeposit(maxRuneAmountToDeposit)
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
    [maxRuneAmountToDeposit, poolData]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      let assetQuantity = assetInput.amount().isGreaterThan(maxRuneAmountToDeposit.amount())
        ? maxRuneAmountToDeposit
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
        const percentToDeposit = maxRuneAmountToDeposit.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToDeposit.amount()).toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [maxRuneAmountToDeposit, poolData]
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

  const oThorchainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.chain(({ thor }) => thor)
      ),
    [fees]
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

  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ asset }) => asset)
      ),
    [fees]
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

  const feesLabel = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ thor: oThorFee, asset: assetFee }) =>
            // Show one (asym deposit)
            // or
            // two fees (sym)
            `${FP.pipe(
              oThorFee,
              O.map((thorFee) => `${formatFee({ amount: thorFee, asset: AssetRuneNative })} + `),
              O.getOrElse(() => '')
            )} ${formatFee({ amount: assetFee, asset })}`
        )
      ),
    [asset, fees, intl]
  )

  const reloadFeesHandler = useCallback(() => reloadFees(type), [reloadFees, type])

  const asymTxModalExtraContent = useMemo(() => {
    // TODO (@Veado) Add i18n
    const asymStepLabels = ['Health check...', 'Send deposit transaction...', 'Check deposit result...']
    const asymStepLabel = FP.pipe(
      asymDepositState.deposit,
      RD.fold(
        () => '',
        () => asymStepLabels[asymDepositState.step - 1],
        () => '',
        // TODO (@Veado) Add i18n
        () => 'Done!'
      )
    )

    return (
      <DepositAssets target={{ asset, amount: assetAmountToDeposit }} source={O.none} stepDescription={asymStepLabel} />
    )
  }, [asymDepositState.deposit, asymDepositState.step, asset, assetAmountToDeposit])

  const symTxModalExtraContent = useMemo(() => {
    // TODO (@Veado) Add i18n
    const stepDescriptions = [
      'Health check...',
      'Send RUNE transaction...',
      'Send Asset transaction...',
      'Check deposit result...'
    ]
    const stepDescription = FP.pipe(
      symDepositState.deposit,
      RD.fold(
        () => '',
        () => stepDescriptions[symDepositState.step - 1],
        () => '',
        // TODO (@Veado) Add i18n
        () => 'Done!'
      )
    )

    return (
      <DepositAssets
        target={{ asset, amount: assetAmountToDeposit }}
        source={O.some({ asset: AssetRuneNative, amount: runeAmountToDeposit })}
        stepDescription={stepDescription}
      />
    )
  }, [symDepositState.deposit, symDepositState.step, asset, assetAmountToDeposit, runeAmountToDeposit])

  const onCloseTxModal = useCallback(() => {
    // unsubscribe
    unsubscribeDepositSub()
    // reset deposit$ subscription
    setDepositSub(O.none)
    // reset deposit states
    setAsymDepositState(INITIAL_ASYM_DEPOSIT_STATE)
    setSymDepositState(INITIAL_SYM_DEPOSIT_STATE)
  }, [setDepositSub, unsubscribeDepositSub])

  const onFinishTxModal = useCallback(() => {
    // Do same things as with closing
    onCloseTxModal()
    // but also refresh balances
    reloadBalances()
  }, [onCloseTxModal, reloadBalances])

  const renderTxModal = useMemo(() => {
    const { deposit: asymRD, depositTx: asymDepositTx } = asymDepositState
    const { deposit: symRD, depositTxs: symDepositTxs } = symDepositState
    const depositRD = type === 'asym' ? asymRD : symRD

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

    const asymExtraResult = <ViewTxButton txHash={RD.toOption(asymDepositTx)} onClick={viewAssetTx} />
    const symExtraResult = (
      <Styled.AsymExtraContainer>
        {FP.pipe(symDepositTxs.rune, RD.toOption, (oTxHash) => (
          <Styled.ViewTxButtonTop
            txHash={oTxHash}
            onClick={viewRuneTx}
            // TODO (@Veado) Add i18n
            label={`View ${AssetRuneNative.symbol} transaction`}
          />
        ))}
        {FP.pipe(symDepositTxs.asset, RD.toOption, (oTxHash) => (
          // TODO (@Veado) Add i18n
          <ViewTxButton txHash={oTxHash} onClick={viewAssetTx} label={`View ${asset.symbol} transaction`} />
        ))}
      </Styled.AsymExtraContainer>
    )

    const extraResult = type === 'asym' ? asymExtraResult : symExtraResult
    const extra = type === 'asym' ? asymTxModalExtraContent : symTxModalExtraContent

    return (
      <TxModal
        title={txModalTitle}
        onClose={onCloseTxModal}
        onFinish={onFinishTxModal}
        startTime={depositStartTime}
        txRD={depositRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={extra}
      />
    )
  }, [
    asymDepositState,
    symDepositState,
    type,
    viewAssetTx,
    asymTxModalExtraContent,
    symTxModalExtraContent,
    onCloseTxModal,
    onFinishTxModal,
    depositStartTime,
    intl,
    viewRuneTx,
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

    if (type === 'asym') {
      // send asym deposit tx
      FP.pipe(
        oAsymDepositMemo,
        O.map((memo) => {
          const sub = asymDeposit$({
            asset,
            poolAddress: oPoolAddress,
            amount: assetAmountToDeposit,
            memo
          }).subscribe(setAsymDepositState)

          // store subscription - needed to unsubscribe while unmounting
          setDepositSub(O.some(sub))

          return true
        })
      )
    } else if (type === 'sym') {
      // _symDepositTx is temporary - will be changed with #537

      FP.pipe(
        oSymDepositMemo,
        O.map((memos) => {
          const sub = symDeposit$({
            asset,
            poolAddress: oPoolAddress,
            amounts: { rune: runeAmountToDeposit, asset: assetAmountToDeposit },
            memos
          }).subscribe(setSymDepositState)

          // store subscription - needed to unsubscribe while unmounting
          setDepositSub(O.some(sub))

          return true
        })
      )
    } else {
      // do nothing
    }
  }, [
    closePasswordModal,
    type,
    oAsymDepositMemo,
    asymDeposit$,
    asset,
    oPoolAddress,
    assetAmountToDeposit,
    setDepositSub,
    oSymDepositMemo,
    symDeposit$,
    runeAmountToDeposit
  ])

  const disabledForm = useMemo(() => isBalanceError || isThorchainFeeError || disabled, [
    disabled,
    isBalanceError,
    isThorchainFeeError
  ])

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

        <Col xs={24} xl={12}>
          {!isAsym && (
            <Styled.AssetCard
              disabled={disabledForm}
              asset={AssetRuneNative}
              selectedAmount={runeAmountToDeposit}
              maxAmount={maxRuneAmountToDeposit}
              onChangeAssetAmount={runeAmountChangeHandler}
              price={runePrice}
              priceAsset={priceAsset}
            />
          )}
        </Col>
      </Styled.CardsRow>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.FeeRow>
            <Col>
              <Styled.ReloadFeeButton onClick={reloadFeesHandler} disabled={RD.isPending(fees)}>
                <SyncOutlined />
              </Styled.ReloadFeeButton>
            </Col>
            <Col>
              <Styled.FeeLabel disabled={RD.isPending(fees)}>
                {isAsym ? intl.formatMessage({ id: 'common.fee' }) : intl.formatMessage({ id: 'common.fees' })}:{' '}
                {feesLabel}
              </Styled.FeeLabel>
            </Col>
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
