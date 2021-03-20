import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
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
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { getEthTokenAddress, isChainAsset, isEthAsset, isEthTokenAsset } from '../../../helpers/assetHelper'
import { isEthChain } from '../../../helpers/chainHelper'
import { eqOPoolAddresses } from '../../../helpers/fp/eq'
import { eqOAsset } from '../../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption } from '../../../helpers/fpHelpers'
import { LiveData } from '../../../helpers/rx/liveData'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import {
  SymDepositMemo,
  SymDepositState,
  SymDepositParams,
  SymDepositStateHandler,
  DepositFeesLD,
  DepositFeesRD
} from '../../../services/chain/types'
import { ApproveParams, IsApprovedRD } from '../../../services/ethereum/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ApiError, TxHashLD, TxHashRD, ValidatePasswordHandler } from '../../../services/wallet/types'
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
  memos: O.Option<SymDepositMemo>
  priceAsset?: Asset
  reloadFees: (p: SymDepositParams) => void
  fees$: (p: SymDepositParams) => DepositFeesLD
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
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
}

type SelectedInput = 'asset' | 'rune' | 'none'

export const SymDeposit: React.FC<Props> = (props) => {
  const {
    asset,
    assetPrice,
    runePrice,
    memos: oMemos,
    assetBalance: oAssetBalance,
    runeBalance: oRuneBalance,
    chainAssetBalance,
    poolAddress: oPoolAddress,
    viewAssetTx = (_) => {},
    viewRuneTx = (_) => {},
    validatePassword$,
    assets,
    priceAsset,
    reloadFees,
    reloadBalances = FP.constVoid,
    fees$,
    onChangeAsset,
    disabled = false,
    poolData,
    deposit$,
    network,
    isApprovedERC20Token$,
    approveERC20Token$
  } = props

  const prevAsset = useRef<O.Option<Asset>>(O.none)

  const intl = useIntl()

  const prevPoolAddresses = useRef<O.Option<PoolAddress>>(O.none)

  const prevChainBalance = useRef<O.Option<BaseAmount>>(O.none)
  const oChainAssetBalance = useMemo(
    () =>
      FP.pipe(
        chainAssetBalance,
        O.map((balance) => {
          prevChainBalance.current = O.some(balance)
          return balance
        }),
        O.alt(() => prevChainBalance.current)
      ),
    [chainAssetBalance]
  )

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

  const prevAssetBalance = useRef<O.Option<BaseAmount>>(O.none)
  const assetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oAssetBalance,
        O.map((balance) => {
          prevAssetBalance.current = O.some(balance)
          return balance
        }),
        O.alt(() => prevAssetBalance.current),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oAssetBalance]
  )

  const prevRuneBalance = useRef<O.Option<BaseAmount>>(O.none)
  const runeBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBalance,
        O.map((balance) => {
          prevRuneBalance.current = O.some(balance)
          return balance
        }),
        O.alt(() => prevRuneBalance.current),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneBalance]
  )

  const oDepositParams: O.Option<SymDepositParams> = useMemo(
    () =>
      FP.pipe(
        sequenceSOption({ poolAddress: oPoolAddress, memos: oMemos }),
        O.map(({ poolAddress, memos }) => ({
          asset,
          poolAddress,
          amounts: { rune: runeAmountToDeposit, asset: assetAmountToDeposit },
          memos
        }))
      ),
    [oPoolAddress, oMemos, asset, runeAmountToDeposit, assetAmountToDeposit]
  )

  const prevDepositFeesRD = useRef<DepositFeesRD>(RD.initial)

  // Input: `oDepositParams` via depositParamsUpdated
  // Output: `DepositFeesRD
  const [depositFeesRD, depositParamsUpdated] = useObservableState<DepositFeesRD, O.Option<SymDepositParams>>(
    (oDepositParams$) =>
      oDepositParams$.pipe(
        RxOp.switchMap(FP.flow(O.fold(() => Rx.of(RD.initial), fees$))),
        RxOp.tap((feesRD) => {
          if (RD.isSuccess(feesRD)) {
            prevDepositFeesRD.current = feesRD
          }
        })
      ),
    RD.initial
  )

  // whenever `oDepositParams` has been updated, `depositParamsUpdated` needs to be called to update `depositFeesRD`
  useEffect(() => depositParamsUpdated(oDepositParams), [depositParamsUpdated, oDepositParams])

  const reloadFeesHandler = useCallback(() => {
    FP.pipe(
      oDepositParams,
      O.map((params) => {
        reloadFees(params)
        return true
      })
    )
  }, [oDepositParams, reloadFees])

  const oThorchainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        Helper.getThorchainFees,
        // Set previously loaded fees to have that values when fees are reloading
        // in other case changing amount while reloading fees will set max amount to zero value
        O.alt((): O.Option<BaseAmount> => Helper.getThorchainFees(prevDepositFeesRD.current))
      ),
    [depositFeesRD]
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
      (amount) => baseAmount(amount, runeBalance.decimal)
    )
  }, [assetBalance, oThorchainFee, poolData, runeBalance])

  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        Helper.getAssetChainFee,
        // Set previously loaded fees to have that values when fees are reloading
        // in other case changing amount while reloading fees will set max amount to zero value
        O.alt((): O.Option<BaseAmount> => Helper.getAssetChainFee(prevDepositFeesRD.current))
      ),
    [depositFeesRD]
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
        (amount) => baseAmount(amount, assetBalance.decimal)
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

      setRuneAmountToDeposit(baseAmount(runeAmountBN, maxRuneAmountToDeposit.decimal))
      setAssetAmountToDeposit(baseAmount(assetAmountBN, maxAssetAmountToDeposit.decimal))
      setPercentValueToDeposit(percent)
    },
    [maxAssetAmountToDeposit, maxRuneAmountToDeposit]
  )

  const onChangeAssetHandler = useCallback(
    (asset: Asset) => {
      onChangeAsset(asset)
      changePercentHandler(0)
    },
    [changePercentHandler, onChangeAsset]
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
      sequenceTOption(
        oThorchainFee,
        FP.pipe(
          oRuneBalance,
          O.alt(() => prevRuneBalance.current)
        )
      ),
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
      sequenceTOption(oAssetChainFee, FP.pipe(oChainAssetBalance)),
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

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: AssetRuneNative.ticker }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: asset.ticker }),
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

  const onCloseTxModal = useCallback(() => {
    resetDepositState()
    changePercentHandler(0)
  }, [resetDepositState, changePercentHandler])

  const onFinishTxModal = useCallback(() => {
    onCloseTxModal()
    reloadBalances()
  }, [reloadBalances, onCloseTxModal])

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
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: AssetRuneNative.ticker })}
          />
        ))}
        {FP.pipe(symDepositTxs.asset, RD.toOption, (oTxHash) => (
          <ViewTxButton
            txHash={oTxHash}
            onClick={viewAssetTx}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: asset.ticker })}
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
        txRD={depositRD}
        timerValue={timerValue}
        extraResult={extraResult}
        extra={txModalExtraContent}
      />
    )
  }, [
    depositState,
    onCloseTxModal,
    onFinishTxModal,
    depositStartTime,
    txModalExtraContent,
    intl,
    viewRuneTx,
    viewAssetTx,
    asset.ticker
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

    FP.pipe(
      oDepositParams,
      O.map((params) => {
        // set start time
        setDepositStartTime(Date.now())
        // subscribe to deposit$
        subscribeDepositState(deposit$(params))

        return true
      })
    )
  }, [closePasswordModal, oDepositParams, subscribeDepositState, deposit$])

  const disabledForm = useMemo(() => isBalanceError || isThorchainFeeError || disabled, [
    disabled,
    isBalanceError,
    isThorchainFeeError
  ])
  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.map(({ asset: assetFeeAmount, thor }) =>
          FP.pipe(
            thor,
            O.fold(
              () => [{ asset, amount: assetFeeAmount }],
              (thorAmount) => [
                { asset, amount: assetFeeAmount },
                { asset: AssetRuneNative, amount: thorAmount }
              ]
            )
          )
        )
      ),
    [depositFeesRD, asset]
  )

  const inputOnBlur = useCallback(() => {
    reloadFeesHandler()
    setSelectedInput('none')
  }, [reloadFeesHandler, setSelectedInput])

  const {
    state: approveState,
    reset: resetApproveState,
    subscribe: subscribeApproveState
  } = useSubscriptionState<TxHashRD>(RD.initial)

  const onApprove = () => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )

    FP.pipe(
      sequenceTOption(oRouterAddress, getEthTokenAddress(asset)),
      O.map(([routerAddress, tokenAddress]) =>
        subscribeApproveState(
          approveERC20Token$({
            spender: routerAddress,
            sender: tokenAddress
          })
        )
      )
    )
  }

  const renderApproveError = useMemo(
    () =>
      FP.pipe(
        approveState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => <Styled.ErrorLabel key="approveErrorLabel">{error.msg}</Styled.ErrorLabel>,
          () => <></>
        )
      ),
    [approveState]
  )

  // State for values of `isApprovedERC20Token$`
  const {
    state: isApprovedState,
    reset: resetIsApprovedState,
    subscribe: subscribeIsApprovedState
  } = useSubscriptionState<IsApprovedRD>(RD.success(true))

  const needApprovement = useMemo(() => {
    // Other chains than ETH do not need an approvement
    if (!isEthChain(asset.chain)) return false
    // ETH does not need to be approved
    if (isEthAsset(asset)) return false
    // ERC20 token does need approvement only
    return isEthTokenAsset(asset)
  }, [asset])

  const isApproved = useMemo(
    () =>
      !needApprovement ||
      RD.isSuccess(approveState) ||
      FP.pipe(
        isApprovedState,
        RD.getOrElse(() => false)
      ),
    [approveState, isApprovedState, needApprovement]
  )

  const checkApprovedStatus = useCallback(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    // check approve status
    FP.pipe(
      sequenceTOption(
        O.fromPredicate((v) => !!v)(needApprovement), // `None` if needApprovement is `false`, no request then
        oRouterAddress,
        getEthTokenAddress(asset)
      ),
      O.map(([_, routerAddress, tokenAddress]) =>
        subscribeIsApprovedState(
          isApprovedERC20Token$({
            spender: routerAddress,
            sender: tokenAddress
          })
        )
      )
    )
  }, [asset, isApprovedERC20Token$, needApprovement, oPoolAddress, subscribeIsApprovedState])

  // TODO (@Veado) Do we still need following dirty check?
  useEffect(() => {
    if (!eqOAsset.equals(prevAsset.current, O.some(asset))) {
      prevAsset.current = O.some(asset)
      // Note: ETH/ERC20 fees won't be reloaded if router is None
      // that's why we have another check for prevPoolRouter in next guard
      reloadFeesHandler()
    }

    if (!eqOPoolAddresses.equals(prevPoolAddresses.current, oPoolAddress)) {
      prevPoolAddresses.current = oPoolAddress
      // reset approve state
      resetApproveState()
      // reset isApproved state
      resetIsApprovedState()
      // check approved status
      checkApprovedStatus()

      // for ETH/ETH20
      if (O.isSome(oPoolAddress)) reloadFeesHandler()
    }
  }, [asset, checkApprovedStatus, oPoolAddress, reloadFeesHandler, resetApproveState, resetIsApprovedState])

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
            inputOnBlurHandler={inputOnBlur}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToDeposit}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAssetHandler}
            priceAsset={priceAsset}
            network={network}
            onAfterSliderChange={reloadFeesHandler}
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
            inputOnBlurHandler={inputOnBlur}
            price={runePrice}
            priceAsset={priceAsset}
            network={network}
          />
        </Col>
      </Styled.CardsRow>

      {isApproved ? (
        <>
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
        </>
      ) : (
        <Styled.SubmitContainer>
          <Styled.ApproveButton onClick={onApprove} loading={RD.isPending(approveState)}>
            {intl.formatMessage({ id: 'swap.approve' })}
          </Styled.ApproveButton>
          {renderApproveError}
        </Styled.SubmitContainer>
      )}
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
