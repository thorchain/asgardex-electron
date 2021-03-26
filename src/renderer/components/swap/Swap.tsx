import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { Address, Balance } from '@xchainjs/xchain-client'
import {
  Asset,
  assetToString,
  formatBN,
  baseToAsset,
  BaseAmount,
  AssetRuneNative,
  baseAmount,
  formatAssetAmount,
  formatAssetAmountCurrency,
  delay,
  assetAmount,
  assetToBase
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import {
  getEthTokenAddress,
  isEthAsset,
  isEthTokenAsset,
  max1e8BaseAmount,
  convertBaseAmountDecimal,
  to1e8BaseAmount
} from '../../helpers/assetHelper'
import { getChainAsset, isEthChain } from '../../helpers/chainHelper'
import { eqAsset, eqBaseAmount, eqOAsset } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { LiveData } from '../../helpers/rx/liveData'
import { filterWalletBalancesByAssets, getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { swap } from '../../routes/pools'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import {
  SwapState,
  SwapTxParams,
  SwapStateHandler,
  SwapFeesHandler,
  LoadSwapFeesHandler,
  SwapFeesRD,
  SwapFeesParams,
  SwapFeesLD,
  SwapFees
} from '../../services/chain/types'
import { ApproveParams, IsApprovedRD } from '../../services/ethereum/types'
import { PoolAssetDetail, PoolAssetDetails, PoolAddress, PoolsDataMap } from '../../services/midgard/types'
import { PoolDetails } from '../../services/midgard/types'
import { getPoolDetailsHashMap } from '../../services/midgard/utils'
import {
  ApiError,
  KeystoreState,
  NonEmptyWalletBalances,
  TxHashLD,
  TxHashRD,
  ValidatePasswordHandler
} from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AssetWithDecimal } from '../../types/asgardex'
import { WalletBalances } from '../../types/wallet'
import { CurrencyInfo } from '../currency'
import { PasswordModal } from '../modal/password'
import { TxModal } from '../modal/tx'
import { SwapAssets } from '../modal/tx/extra'
import { ViewTxButton } from '../uielements/button'
import { Fees, UIFeesRD } from '../uielements/fees'
import { Slider } from '../uielements/slider'
import * as Styled from './Swap.styles'
import { getSwapData, poolAssetDetailToAsset, pickPoolAsset, SwapData } from './Swap.utils'

export type ConfirmSwapParams = { asset: Asset; amount: BaseAmount; memo: string }

export type SwapProps = {
  keystore: KeystoreState
  availableAssets: PoolAssetDetails
  sourceAsset: AssetWithDecimal
  targetAsset: AssetWithDecimal
  poolAddress: O.Option<PoolAddress>
  swap$: SwapStateHandler
  poolDetails: PoolDetails
  walletBalances: O.Option<NonEmptyWalletBalances>
  goToTransaction: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadFees: LoadSwapFeesHandler
  reloadBalances: FP.Lazy<void>
  fees$: SwapFeesHandler
  targetWalletAddress: O.Option<Address>
  onChangePath: (path: string) => void
  network: Network
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
}

export const Swap = ({
  keystore,
  availableAssets,
  sourceAsset: sourceAssetWD,
  targetAsset: targetAssetWD,
  poolAddress: oPoolAddress,
  swap$,
  poolDetails,
  walletBalances,
  goToTransaction = (_) => {},
  validatePassword$,
  reloadFees,
  reloadBalances = FP.constVoid,
  fees$,
  targetWalletAddress,
  onChangePath,
  network,
  isApprovedERC20Token$,
  approveERC20Token$
}: SwapProps) => {
  const intl = useIntl()

  const unlockedWallet = useMemo(() => isLocked(keystore) || !hasImportedKeystore(keystore), [keystore])

  const { asset: sourceAssetProp, decimal: sourceAssetDecimal } = sourceAssetWD
  const { asset: targetAssetProp, decimal: targetAssetDecimal } = targetAssetWD

  const prevSourceAsset = useRef<O.Option<Asset>>(O.none)
  const prevTargetAsset = useRef<O.Option<Asset>>(O.none)

  // convert to hash map here instead of using getPoolDetail
  const poolsData: PoolsDataMap = useMemo(() => getPoolDetailsHashMap(poolDetails, AssetRuneNative), [poolDetails])

  const oSourcePoolAsset: O.Option<PoolAssetDetail> = useMemo(() => pickPoolAsset(availableAssets, sourceAssetProp), [
    availableAssets,
    sourceAssetProp
  ])

  const oTargetPoolAsset: O.Option<PoolAssetDetail> = useMemo(() => pickPoolAsset(availableAssets, targetAssetProp), [
    availableAssets,
    targetAssetProp
  ])

  const sourceAsset: O.Option<Asset> = useMemo(() => poolAssetDetailToAsset(oSourcePoolAsset), [oSourcePoolAsset])
  const targetAsset: O.Option<Asset> = useMemo(() => poolAssetDetailToAsset(oTargetPoolAsset), [oTargetPoolAsset])

  const assetsToSwap: O.Option<{ source: Asset; target: Asset }> = useMemo(
    () => sequenceSOption({ source: sourceAsset, target: targetAsset }),
    [sourceAsset, targetAsset]
  )

  // `AssetWB` of source asset - which might be none (user has no balances for this asset or wallet is locked)
  const oSourceAssetWB: O.Option<Balance> = useMemo(() => getWalletBalanceByAsset(walletBalances, sourceAsset), [
    walletBalances,
    sourceAsset
  ])

  // User balance for source asset
  const sourceAssetAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oSourceAssetWB,
        O.map(({ amount }) => amount),
        O.getOrElse(() => baseAmount(0, sourceAssetDecimal))
      ),
    [oSourceAssetWB, sourceAssetDecimal]
  )

  /** Balance of source asset converted to <= 1e8 */
  const sourceAssetAmountMax1e8: BaseAmount = useMemo(() => max1e8BaseAmount(sourceAssetAmount), [sourceAssetAmount])

  // source chain asset
  const sourceChainAsset = useMemo(() => getChainAsset(sourceAssetProp.chain), [sourceAssetProp])

  // User balance for source chain asset
  const sourceChainAssetAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        getWalletBalanceByAsset(walletBalances, O.some(sourceChainAsset)),
        O.map(({ amount }) => amount),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [walletBalances, sourceChainAsset]
  )

  const { state: swapState, reset: resetSwapState, subscribe: subscribeSwapState } = useSubscriptionState<SwapState>(
    INITIAL_SWAP_STATE
  )

  const initialAmountToSwapMax1e8 = useMemo(() => baseAmount(0, sourceAssetAmountMax1e8.decimal), [
    sourceAssetAmountMax1e8
  ])

  const [
    /* max. 1e8 decimal */
    amountToSwapMax1e8,
    _setAmountToSwapMax1e8 /* private - never set it directly, use setAmountToSwap() instead */
  ] = useState(initialAmountToSwapMax1e8)

  const oSwapParams: O.Option<SwapTxParams> = useMemo(() => {
    return FP.pipe(
      sequenceTOption(assetsToSwap, oPoolAddress, targetWalletAddress),
      O.map(([{ source, target }, poolAddress, address]) => ({
        poolAddress,
        asset: source,
        // Decimal needs to be converted back for using orginal decimal of source asset
        amount: convertBaseAmountDecimal(amountToSwapMax1e8, sourceAssetDecimal),
        memo: getSwapMemo({ asset: target, address })
      }))
    )
  }, [amountToSwapMax1e8, assetsToSwap, oPoolAddress, sourceAssetDecimal, targetWalletAddress])

  const swapData: SwapData = useMemo(
    () => getSwapData({ amountToSwap: amountToSwapMax1e8, sourceAsset, targetAsset, poolsData }),
    [amountToSwapMax1e8, sourceAsset, targetAsset, poolsData]
  )

  const swapResultAmountMax1e8: BaseAmount = useMemo(() => {
    // 1. Convert result to original decimal of target asset
    // orignal decimal might be < 1e8
    const swapResultAmount = convertBaseAmountDecimal(swapData.swapResult, targetAssetDecimal)
    // 2. But we still need to make sure it <= 1e8
    return max1e8BaseAmount(swapResultAmount)
  }, [swapData.swapResult, targetAssetDecimal])

  const oSwapFeesParams: O.Option<SwapFeesParams> = useMemo(
    () =>
      FP.pipe(
        oSwapParams,
        O.map((swapParams) => ({
          inTx: swapParams,
          outTx: {
            asset: targetAssetProp,
            memo: swapParams.memo
          }
        }))
      ),
    [oSwapParams, targetAssetProp]
  )

  // Flag for pending assets state
  // needed to avoid race condition of fee errors and balances
  // while switching assets and reloading fees
  const [pendingSwitchAssets, _setPendingSwitchAssets] = useState(false)

  const setPendingSwitchAssets = useCallback(
    (value: boolean) => {
      if (!isLocked(keystore)) {
        _setPendingSwitchAssets(value)
      }
    },
    [keystore]
  )

  const chainFees$ = useMemo(() => fees$, [fees$])

  const [chainFeesRD] = useObservableState<SwapFeesRD>(
    () =>
      FP.pipe(
        oSwapFeesParams,
        O.map(chainFees$),
        O.getOrElse<SwapFeesLD>(() => Rx.of(RD.initial))
      ),
    RD.initial
  )

  // reset `pendingSwitchAssets`
  // whenever chain fees will be succeeded or failed
  useEffect(() => {
    FP.pipe(
      chainFeesRD,
      RD.fold(
        () => false,
        () => true,
        () => false,
        () => false
      ),
      setPendingSwitchAssets
    )
  }, [chainFeesRD, setPendingSwitchAssets])

  const reloadFeesHandler = useCallback(() => {
    FP.pipe(oSwapFeesParams, O.map(reloadFees))
  }, [oSwapFeesParams, reloadFees])

  // Swap start time
  const [swapStartTime, setSwapStartTime] = useState<number>(0)

  const setSourceAsset = useCallback(
    async (asset: Asset) => {
      // update `pendingSwitchAssets` state
      setPendingSwitchAssets(true)

      // delay to avoid render issues while switching
      await delay(100)

      FP.pipe(
        targetAsset,
        O.map((targetAsset) =>
          onChangePath(
            swap.path({
              source: assetToString(asset),
              target: assetToString(targetAsset)
            })
          )
        )
      )
    },
    [onChangePath, setPendingSwitchAssets, targetAsset]
  )

  const setTargetAsset = useCallback(
    async (asset: Asset) => {
      // update `pendingSwitchAssets` state
      setPendingSwitchAssets(true)

      // delay to avoid render issues while switching
      await delay(100)

      FP.pipe(
        sourceAsset,
        O.map((sourceAsset) =>
          onChangePath(
            swap.path({
              source: assetToString(sourceAsset),
              target: assetToString(asset)
            })
          )
        )
      )
    },
    [onChangePath, setPendingSwitchAssets, sourceAsset]
  )

  // Max amount to swap
  // depends on users balances of source asset
  // and of fees to pay for source chain txs
  // Decimal always <= 1e8 based
  const maxAmountToSwapMax1e8: BaseAmount = useMemo(() => {
    // make sure not logged in user can play around with swap
    if (unlockedWallet) return assetToBase(assetAmount(Number.MAX_SAFE_INTEGER, sourceAssetAmountMax1e8.decimal))

    // max amount for sourc chain asset
    const maxChainAssetAmount: BaseAmount = FP.pipe(
      RD.toOption(chainFeesRD),
      O.fold(
        // Ingnore fees and use balance of source chain asset for max.
        () => sourceChainAssetAmount,
        ({ inTx }) => {
          let max = sourceChainAssetAmount.amount().minus(inTx.amount())
          max = max.isGreaterThan(0) ? max : ZERO_BN
          return baseAmount(max, sourceChainAssetAmount.decimal)
        }
      )
    )
    return eqAsset.equals(sourceChainAsset, sourceAssetProp)
      ? max1e8BaseAmount(maxChainAssetAmount)
      : sourceAssetAmountMax1e8
  }, [unlockedWallet, sourceAssetAmountMax1e8, chainFeesRD, sourceChainAsset, sourceAssetProp, sourceChainAssetAmount])

  const setAmountToSwapMax1e8 = useCallback(
    (amountToSwap: BaseAmount) => {
      const newAmount = baseAmount(amountToSwap.amount(), maxAmountToSwapMax1e8.decimal)

      // dirty check - do nothing if prev. and next amounts are equal
      if (eqBaseAmount.equals(newAmount, amountToSwapMax1e8)) return {}

      const newAmountToSwap = newAmount.amount().isGreaterThan(maxAmountToSwapMax1e8.amount())
        ? maxAmountToSwapMax1e8
        : newAmount

      /**
       * New object instance of `amountToSwap` is needed to make
       * AssetInput component react to the new value.
       * In case maxAmount has the same pointer
       * AssetInput will not be updated as a React-component
       * but native input element will change its
       * inner value and user will see inappropriate value
       */
      _setAmountToSwapMax1e8({ ...newAmountToSwap })
    },
    [amountToSwapMax1e8, maxAmountToSwapMax1e8]
  )

  const setAmountToSwapFromPercentValue = useCallback(
    (percents) => {
      const amountFromPercentage = maxAmountToSwapMax1e8.amount().multipliedBy(Number(percents) / 100)
      return setAmountToSwapMax1e8(baseAmount(amountFromPercentage, sourceAssetAmountMax1e8.decimal))
    },
    [maxAmountToSwapMax1e8, setAmountToSwapMax1e8, sourceAssetAmountMax1e8.decimal]
  )

  const allAssets = useMemo((): Asset[] => availableAssets.map(({ asset }) => asset), [availableAssets])

  const assetSymbolsInWallet: O.Option<string[]> = useMemo(
    () => FP.pipe(walletBalances, O.map(A.map(({ asset }) => asset.symbol.toUpperCase()))),
    [walletBalances]
  )

  const allBalances = FP.pipe(
    walletBalances,
    O.map((balances) => filterWalletBalancesByAssets(balances, allAssets)),
    O.getOrElse(() => [] as WalletBalances)
  )

  const balancesToSwapFrom = useMemo((): WalletBalances => {
    const filteredBalances: WalletBalances = FP.pipe(
      allBalances,
      A.filter((balance) =>
        FP.pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(balance.asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (balances) => (balances.length ? balances : allBalances)
    )

    return FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        FP.pipe(
          filteredBalances,
          A.filter((balance) => balance.asset.symbol !== source.symbol && balance.asset.symbol !== target.symbol)
        )
      ),
      O.getOrElse(() => allBalances)
    )
  }, [assetsToSwap, assetSymbolsInWallet, allBalances])

  const balancesToSwapTo = useMemo((): WalletBalances => {
    return FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        FP.pipe(
          allBalances,
          A.filter((balance) => balance.asset.symbol !== source.symbol && balance.asset.symbol !== target.symbol)
        )
      ),
      O.getOrElse(() => allBalances)
    )
  }, [assetsToSwap, allBalances])

  const balanceLabel = useMemo(
    () => `${intl.formatMessage({ id: 'swap.balance' })}: ${formatBN(baseToAsset(sourceAssetAmountMax1e8).amount())}`,
    [intl, sourceAssetAmountMax1e8]
  )

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const onSwapConfirmed = useCallback(() => {
    setShowPasswordModal(true)
  }, [setShowPasswordModal])

  const renderSlider = useMemo(() => {
    const percentage = unlockedWallet
      ? 0
      : amountToSwapMax1e8
          .amount()
          .dividedBy(sourceAssetAmountMax1e8.amount())
          .multipliedBy(100)
          // Remove decimal of `BigNumber`s used within `BaseAmount` and always round down for currencies
          .decimalPlaces(0, BigNumber.ROUND_DOWN)
          .toNumber()
    return (
      <Slider
        key={'swap percentage slider'}
        value={percentage}
        onChange={setAmountToSwapFromPercentValue}
        onAfterChange={reloadFeesHandler}
        tooltipVisible={true}
        withLabel={true}
        tooltipPlacement={'top'}
        disabled={unlockedWallet}
      />
    )
  }, [unlockedWallet, amountToSwapMax1e8, sourceAssetAmountMax1e8, setAmountToSwapFromPercentValue, reloadFeesHandler])

  const extraTxModalContent = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oSourcePoolAsset, oTargetPoolAsset),
      O.map(([sourceAssetWP, targetAssetWP]) => {
        const targetAsset = targetAssetWP.asset
        const sourceAsset = sourceAssetWP.asset

        const stepLabels = [
          intl.formatMessage({ id: 'common.tx.healthCheck' }),
          intl.formatMessage({ id: 'common.tx.sending' }),
          intl.formatMessage({ id: 'common.tx.checkResult' })
        ]
        const stepLabel = FP.pipe(
          swapState.swap,
          RD.fold(
            () => '',
            () =>
              `${intl.formatMessage(
                { id: 'common.step' },
                { current: swapState.step, total: swapState.stepsTotal }
              )}: ${stepLabels[swapState.step - 1]}`,
            () => '',
            () => 'Done!'
          )
        )

        return (
          <SwapAssets
            key="swap-assets"
            source={{ asset: sourceAsset, amount: amountToSwapMax1e8 }}
            target={{ asset: targetAsset, amount: swapResultAmountMax1e8 }}
            stepDescription={stepLabel}
            slip={swapData.slip}
            network={network}
          />
        )
      }),
      O.getOrElse(() => <></>)
    )
  }, [
    oSourcePoolAsset,
    oTargetPoolAsset,
    intl,
    swapState.swap,
    swapState.step,
    swapState.stepsTotal,
    amountToSwapMax1e8,
    swapResultAmountMax1e8,
    swapData.slip,
    network
  ])

  const onFinishTxModal = useCallback(() => {
    resetSwapState()
    reloadBalances()
    setAmountToSwapMax1e8(initialAmountToSwapMax1e8)
  }, [resetSwapState, reloadBalances, setAmountToSwapMax1e8, initialAmountToSwapMax1e8])

  const renderTxModal = useMemo(() => {
    const { swapTx, swap } = swapState

    // don't render TxModal in initial state
    if (RD.isInitial(swap)) return <></>

    // Get timer value
    const timerValue = FP.pipe(
      swap,
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
      swap,
      RD.fold(
        () => 'swap.state.pending',
        () => 'swap.state.pending',
        () => 'swap.state.error',
        () => 'swap.state.success'
      ),
      (id) => intl.formatMessage({ id })
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={resetSwapState}
        onFinish={onFinishTxModal}
        startTime={swapStartTime}
        txRD={swap}
        extraResult={<ViewTxButton txHash={RD.toOption(swapTx)} onClick={goToTransaction} />}
        timerValue={timerValue}
        extra={extraTxModalContent}
      />
    )
  }, [extraTxModalContent, goToTransaction, intl, onFinishTxModal, resetSwapState, swapStartTime, swapState])

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
      oSwapParams,
      O.map((swapParams) => {
        // set start time
        setSwapStartTime(Date.now())
        // subscribe to swap$
        subscribeSwapState(swap$(swapParams))

        return true
      })
    )
  }, [closePasswordModal, oSwapParams, subscribeSwapState, swap$])

  const sourceChainError: boolean = useMemo(() => {
    // never error while switching assets
    if (pendingSwitchAssets) return false

    return FP.pipe(
      chainFeesRD,
      RD.getOrElse(() => ({ inTx: ZERO_BASE_AMOUNT, outTx: ZERO_BASE_AMOUNT })),
      ({ inTx }) => sourceChainAssetAmount.amount().minus(inTx.amount()).isNegative()
    )
  }, [chainFeesRD, pendingSwitchAssets, sourceChainAssetAmount])

  const sourceChainErrorLabel: JSX.Element = useMemo(() => {
    if (!sourceChainError) {
      return <></>
    }

    return FP.pipe(
      RD.toOption(chainFeesRD),
      O.map((fees) => (
        <Styled.BalanceErrorLabel key="sourceChainErrorLabel">
          {intl.formatMessage(
            { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
            {
              balance: formatAssetAmountCurrency({
                asset: sourceAssetProp,
                amount: baseToAsset(sourceAssetAmount),
                trimZeros: true
              }),
              fee: formatAssetAmountCurrency({
                asset: sourceChainAsset,
                trimZeros: true,
                amount: baseToAsset(fees.inTx)
              })
            }
          )}
        </Styled.BalanceErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [sourceChainError, chainFeesRD, intl, sourceAssetProp, sourceAssetAmount, sourceChainAsset])

  const targetChainFeeAmountInTargetAsset: BaseAmount = useMemo(() => {
    const fees: SwapFees = FP.pipe(
      chainFeesRD,
      RD.getOrElse(() => ({ inTx: ZERO_BASE_AMOUNT, outTx: ZERO_BASE_AMOUNT }))
    )

    return FP.pipe(
      targetAsset,
      O.map((asset) => {
        const chainAsset: Asset = getChainAsset(asset.chain)
        const oChainAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(chainAsset)])
        const oAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(asset)])

        return FP.pipe(
          sequenceTOption(oChainAssetPoolData, oAssetPoolData),
          O.fold(
            () => ZERO_BASE_AMOUNT,
            ([chainAssetPoolData, assetPoolData]) =>
              eqAsset.equals(chainAsset, asset)
                ? fees.outTx
                : // pool data are always 1e8 decimal based
                  // and we have to convert fees to 1e8, too
                  getValueOfAsset1InAsset2(to1e8BaseAmount(fees.outTx), chainAssetPoolData, assetPoolData)
          )
        )
      }),
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )
  }, [chainFeesRD, targetAsset, poolsData])

  const swapResultLabel = useMemo(
    () =>
      FP.pipe(
        O.some(formatAssetAmount({ amount: baseToAsset(swapResultAmountMax1e8), trimZeros: true })),
        O.getOrElse(() => formatBN(ZERO_BN))
      ),
    [swapResultAmountMax1e8]
  )

  const fees: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        sequenceTRD(chainFeesRD, RD.success(targetChainFeeAmountInTargetAsset)),
        RD.map(([chainFee, targetFee]) => [
          { asset: getChainAsset(sourceAssetProp.chain), amount: chainFee.inTx },
          { asset: targetAssetProp, amount: targetFee }
        ])
      ),
    [chainFeesRD, targetChainFeeAmountInTargetAsset, sourceAssetProp.chain, targetAssetProp]
  )

  const isSwapDisabled: boolean = useMemo(
    () => unlockedWallet || amountToSwapMax1e8.amount().isZero() || FP.pipe(walletBalances, O.isNone),
    [unlockedWallet, amountToSwapMax1e8, walletBalances]
  )

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
      sequenceTOption(oRouterAddress, getEthTokenAddress(sourceAssetProp)),
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
    // not needed for users with locked or not imported wallets
    if (!hasImportedKeystore(keystore) || isLocked(keystore)) return false
    // Other chains than ETH do not need an approvement
    if (!isEthChain(sourceChainAsset.chain)) return false
    // ETH does not need to be approved
    if (isEthAsset(sourceAssetProp)) return false
    // ERC20 token does need approvement only
    return isEthTokenAsset(sourceAssetProp)
  }, [keystore, sourceAssetProp, sourceChainAsset.chain])

  const isApproved = useMemo(() => {
    if (!needApprovement) return true
    // ignore initial + loading states for `isApprovedState`
    if (RD.isInitial(isApprovedState) || RD.isPending(isApprovedState)) return true

    return (
      RD.isSuccess(approveState) ||
      FP.pipe(
        isApprovedState,
        RD.getOrElse(() => false)
      )
    )
  }, [approveState, isApprovedState, needApprovement])

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
        getEthTokenAddress(sourceAssetProp)
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
  }, [isApprovedERC20Token$, needApprovement, oPoolAddress, sourceAssetProp, subscribeIsApprovedState])

  const reset = useCallback(() => {
    // reset swap state
    resetSwapState()
    // reset approve state
    resetApproveState()
    // reset isApproved state
    resetIsApprovedState()
    // zero amount to swap
    setAmountToSwapMax1e8(initialAmountToSwapMax1e8)
    // reload fees
    reloadFeesHandler()
    // check approved status
    checkApprovedStatus()
  }, [
    checkApprovedStatus,
    initialAmountToSwapMax1e8,
    reloadFeesHandler,
    resetApproveState,
    resetIsApprovedState,
    resetSwapState,
    setAmountToSwapMax1e8
  ])

  useEffect(() => {
    // reset data whenever source asset has been changed
    if (!eqOAsset.equals(prevSourceAsset.current, O.some(sourceAssetProp))) {
      prevSourceAsset.current = O.some(sourceAssetProp)
      reset()
    }
    // reset data whenever target asset has been changed
    if (!eqOAsset.equals(prevTargetAsset.current, O.some(targetAssetProp))) {
      prevTargetAsset.current = O.some(targetAssetProp)
      reset()
    }
  }, [checkApprovedStatus, oPoolAddress, reset, setAmountToSwapMax1e8, sourceAssetProp, targetAssetProp])

  // Reload fees whenever swap params has been changed
  useEffect(() => {
    FP.pipe(oSwapFeesParams, O.map(reloadFees))
  }, [oSwapFeesParams, reloadFees])

  const canSwitchAssets = useMemo(() => {
    const hasBalances = FP.pipe(
      walletBalances,
      O.map(A.map(({ asset }) => asset)),
      (oAssetSymbols) => sequenceTOption(oAssetSymbols, targetAsset),
      O.map(([balances, targetAsset]) => FP.pipe(balances, A.elem(eqAsset)(targetAsset))),
      O.getOrElse(() => true)
    )

    // no switch if no balances or while switching assets
    return hasBalances && !pendingSwitchAssets
  }, [walletBalances, pendingSwitchAssets, targetAsset])

  const onSwitchAssets = useCallback(async () => {
    if (!canSwitchAssets) {
      return
    }

    // update `pendingSwitchAsset` state
    setPendingSwitchAssets(true)
    // delay to avoid render issues while switching
    await delay(100)

    FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        onChangePath(
          swap.path({
            target: assetToString(source),
            source: assetToString(target)
          })
        )
      )
    )
  }, [canSwitchAssets, setPendingSwitchAssets, assetsToSwap, onChangePath])

  return (
    <Styled.Container>
      <Styled.ContentContainer>
        <Styled.Header>
          {FP.pipe(
            assetsToSwap,
            O.map(
              ({ source, target }) => `${intl.formatMessage({ id: 'common.swap' })} ${source.ticker} > ${target.ticker}`
            ),
            O.getOrElse(() => `${intl.formatMessage({ id: 'swap.state.error' })} - No such assets`)
          )}
        </Styled.Header>

        <Styled.FormContainer>
          <Styled.CurrencyInfoContainer>
            <CurrencyInfo slip={swapData.slip} from={oSourcePoolAsset} to={oTargetPoolAsset} />
          </Styled.CurrencyInfoContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-out'}>
            {/* Note: Input value is shown as AssetAmount */}
            <Styled.AssetInput
              title={intl.formatMessage({ id: 'swap.input' })}
              label={balanceLabel}
              onChange={setAmountToSwapMax1e8}
              onBlur={reloadFeesHandler}
              amount={amountToSwapMax1e8}
              hasError={sourceChainError}
            />
            {FP.pipe(
              sourceAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <Styled.AssetSelect
                    onSelect={setSourceAsset}
                    asset={asset}
                    balances={balancesToSwapFrom}
                    disabled={!canSwitchAssets}
                    network={network}
                  />
                )
              )
            )}
          </Styled.ValueItemContainer>

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>
              {renderSlider}
              {sourceChainErrorLabel}
            </Styled.SliderContainer>
            <Styled.SwapOutlined disabled={!canSwitchAssets} onClick={onSwitchAssets} />
          </Styled.ValueItemContainer>
          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValueContainer>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <Styled.InValueLabel>{swapResultLabel}</Styled.InValueLabel>
            </Styled.InValueContainer>
            {FP.pipe(
              targetAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <Styled.AssetSelect
                    onSelect={setTargetAsset}
                    asset={asset}
                    balances={balancesToSwapTo}
                    disabled={!canSwitchAssets}
                    network={network}
                  />
                )
              )
            )}
          </Styled.ValueItemContainer>
        </Styled.FormContainer>
      </Styled.ContentContainer>
      {isApproved ? (
        <Styled.SubmitContainer>
          {FP.pipe(
            sequenceTOption(sourceAsset, targetAsset),
            O.fold(
              () => <></>,
              ([source, target]) => (
                <Styled.Drag
                  disabled={isSwapDisabled}
                  onConfirm={onSwapConfirmed}
                  title={intl.formatMessage({ id: 'swap.drag' })}
                  source={source}
                  target={target}
                  network={network}
                />
              )
            )
          )}
          <Styled.NoteLabel align="center">
            {!hasImportedKeystore(keystore)
              ? intl.formatMessage({ id: 'swap.note.nowallet' })
              : isLocked(keystore) && intl.formatMessage({ id: 'swap.note.lockedWallet' })}
          </Styled.NoteLabel>
          {!RD.isInitial(fees) && <Fees fees={fees} reloadFees={reloadFeesHandler} />}
        </Styled.SubmitContainer>
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
