import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { Address, Balance } from '@xchainjs/xchain-client'
import {
  Asset,
  assetToString,
  baseToAsset,
  BaseAmount,
  baseAmount,
  formatAssetAmount,
  formatAssetAmountCurrency,
  delay,
  assetAmount,
  assetToBase,
  Chain
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ZERO_BASE_AMOUNT } from '../../const'
import {
  getEthTokenAddress,
  isEthAsset,
  isEthTokenAsset,
  max1e8BaseAmount,
  convertBaseAmountDecimal,
  to1e8BaseAmount
} from '../../helpers/assetHelper'
import { getChainAsset, isEthChain } from '../../helpers/chainHelper'
import { eqAsset, eqBaseAmount, eqChain, eqOAsset, eqOApproveParams } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption } from '../../helpers/fpHelpers'
import * as PoolHelpers from '../../helpers/poolHelper'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { filterWalletBalancesByAssets, getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { swap } from '../../routes/pools'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import { getZeroSwapFees } from '../../services/chain/fees/swap'
import {
  SwapState,
  SwapTxParams,
  SwapStateHandler,
  SwapFeesHandler,
  ReloadSwapFeesHandler,
  SwapFeesRD,
  SwapFees,
  FeeRD
} from '../../services/chain/types'
import { ApproveFeeHandler, ApproveParams, IsApprovedRD, LoadApproveFeeHandler } from '../../services/ethereum/types'
import { PoolAssetDetail, PoolAssetDetails, PoolAddress, PoolsDataMap } from '../../services/midgard/types'
import {
  ApiError,
  KeystoreState,
  TxHashLD,
  TxHashRD,
  ValidatePasswordHandler,
  BalancesState
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
import { SwapData } from './Swap.types'
import * as Utils from './Swap.utils'

export type ConfirmSwapParams = { asset: Asset; amount: BaseAmount; memo: string }

export type SwapProps = {
  keystore: KeystoreState
  availableAssets: PoolAssetDetails
  assets: { inAsset: AssetWithDecimal; outAsset: AssetWithDecimal }
  poolAddress: O.Option<PoolAddress>
  swap$: SwapStateHandler
  poolsData: PoolsDataMap
  walletBalances: Pick<BalancesState, 'balances' | 'loading'>
  goToTransaction: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadFees: ReloadSwapFeesHandler
  reloadBalances: FP.Lazy<void>
  fees$: SwapFeesHandler
  reloadApproveFee: LoadApproveFeeHandler
  approveFee$: ApproveFeeHandler
  targetWalletAddress: O.Option<Address>
  onChangePath: (path: string) => void
  network: Network
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
  importWalletHandler: FP.Lazy<void>
  haltedChains: Chain[]
}

export const Swap = ({
  keystore,
  availableAssets,
  assets: { inAsset: sourceAssetWD, outAsset: targetAssetWD },
  poolAddress: oPoolAddress,
  swap$,
  poolsData,
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
  approveERC20Token$,
  reloadApproveFee,
  approveFee$,
  importWalletHandler,
  haltedChains
}: SwapProps) => {
  const intl = useIntl()

  const unlockedWallet = useMemo(() => isLocked(keystore) || !hasImportedKeystore(keystore), [keystore])

  const { balances: oWalletBalances, loading: walletBalancesLoading } = walletBalances

  const { asset: sourceAssetProp, decimal: sourceAssetDecimal } = sourceAssetWD
  const { asset: targetAssetProp, decimal: targetAssetDecimal } = targetAssetWD

  const prevSourceAsset = useRef<O.Option<Asset>>(O.none)
  const prevTargetAsset = useRef<O.Option<Asset>>(O.none)

  const oSourcePoolAsset: O.Option<PoolAssetDetail> = useMemo(
    () => Utils.pickPoolAsset(availableAssets, sourceAssetProp),
    [availableAssets, sourceAssetProp]
  )

  const oTargetPoolAsset: O.Option<PoolAssetDetail> = useMemo(
    () => Utils.pickPoolAsset(availableAssets, targetAssetProp),
    [availableAssets, targetAssetProp]
  )

  const oSourceAsset: O.Option<Asset> = useMemo(
    () => Utils.poolAssetDetailToAsset(oSourcePoolAsset),
    [oSourcePoolAsset]
  )
  const oTargetAsset: O.Option<Asset> = useMemo(
    () => Utils.poolAssetDetailToAsset(oTargetPoolAsset),
    [oTargetPoolAsset]
  )

  const isChainHalted = useMemo(() => PoolHelpers.isChainHalted(haltedChains), [haltedChains])

  const hasHaltedChain = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oSourceAsset, oTargetAsset),
        O.map(
          ([{ chain: sourceChain }, { chain: targetChain }]) => isChainHalted(sourceChain) || isChainHalted(targetChain)
        ),
        O.getOrElse(() => true)
      ),
    [isChainHalted, oSourceAsset, oTargetAsset]
  )

  const assetsToSwap: O.Option<{ source: Asset; target: Asset }> = useMemo(
    () => sequenceSOption({ source: oSourceAsset, target: oTargetAsset }),
    [oSourceAsset, oTargetAsset]
  )

  // `AssetWB` of source asset - which might be none (user has no balances for this asset or wallet is locked)
  const oSourceAssetWB: O.Option<Balance> = useMemo(
    () => getWalletBalanceByAsset(oWalletBalances, oSourceAsset),
    [oWalletBalances, oSourceAsset]
  )

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
        getWalletBalanceByAsset(oWalletBalances, O.some(sourceChainAsset)),
        O.map(({ amount }) => amount),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oWalletBalances, sourceChainAsset]
  )

  const {
    state: swapState,
    reset: resetSwapState,
    subscribe: subscribeSwapState
  } = useSubscriptionState<SwapState>(INITIAL_SWAP_STATE)

  const initialAmountToSwapMax1e8 = useMemo(
    () => baseAmount(0, sourceAssetAmountMax1e8.decimal),
    [sourceAssetAmountMax1e8]
  )

  const [
    /* max. 1e8 decimal */
    amountToSwapMax1e8,
    _setAmountToSwapMax1e8 /* private - never set it directly, use setAmountToSwap() instead */
  ] = useState(initialAmountToSwapMax1e8)

  const isZeroAmountToSwap = useMemo(() => amountToSwapMax1e8.amount().isZero(), [amountToSwapMax1e8])

  const zeroSwapFees = useMemo(
    () => getZeroSwapFees({ inAsset: sourceAssetProp, outAsset: targetAssetProp }),
    [sourceAssetProp, targetAssetProp]
  )

  const oSwapParams: O.Option<SwapTxParams> = useMemo(() => {
    return FP.pipe(
      sequenceTOption(assetsToSwap, oPoolAddress, targetWalletAddress),
      O.map(([{ source, target }, poolAddress, address]) => {
        return {
          poolAddress,
          asset: source,
          // Decimal needs to be converted back for using orginal decimal of source asset
          amount: convertBaseAmountDecimal(amountToSwapMax1e8, sourceAssetDecimal),
          memo: getSwapMemo({ asset: target, address })
        }
      })
    )
  }, [amountToSwapMax1e8, assetsToSwap, oPoolAddress, sourceAssetDecimal, targetWalletAddress])

  const swapData: SwapData = useMemo(
    () =>
      Utils.getSwapData({
        amountToSwap: amountToSwapMax1e8,
        sourceAsset: oSourceAsset,
        targetAsset: oTargetAsset,
        poolsData
      }),
    [amountToSwapMax1e8, oSourceAsset, oTargetAsset, poolsData]
  )

  const swapResultAmountMax1e8: BaseAmount = useMemo(() => {
    // 1. Convert result to original decimal of target asset
    // orignal decimal might be < 1e8
    const swapResultAmount = convertBaseAmountDecimal(swapData.swapResult, targetAssetDecimal)
    // 2. But we still need to make sure it <= 1e8
    return max1e8BaseAmount(swapResultAmount)
  }, [swapData.swapResult, targetAssetDecimal])

  const oApproveParams: O.Option<ApproveParams> = useMemo(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    const oTokenAddress: O.Option<string> = getEthTokenAddress(sourceAssetProp)

    return FP.pipe(
      sequenceTOption(oTokenAddress, oRouterAddress),
      O.map(([tokenAddress, routerAddress]) => ({
        spender: routerAddress,
        sender: tokenAddress
      }))
    )
  }, [oPoolAddress, sourceAssetProp])

  // Reload balances at `onMount`
  useEffect(() => {
    reloadBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevChainFees = useRef<O.Option<SwapFees>>(O.none)

  const [swapFeesRD] = useObservableState<SwapFeesRD>(() => {
    return FP.pipe(
      fees$({
        inAsset: sourceAssetProp,
        outAsset: targetAssetProp
      }),
      liveData.map((chainFees) => {
        // store every successfully loaded chainFees to the ref value
        prevChainFees.current = O.some(chainFees)
        return chainFees
      })
    )
  }, RD.success(zeroSwapFees))

  const swapFees: SwapFees = useMemo(
    () =>
      FP.pipe(
        swapFeesRD,
        RD.toOption,
        O.alt(() => prevChainFees.current),
        O.getOrElse(() => zeroSwapFees)
      ),
    [swapFeesRD, zeroSwapFees]
  )

  const reloadFeesHandler = useCallback(() => {
    reloadFees({
      inAsset: sourceAssetProp,
      outAsset: targetAssetProp
    })
  }, [reloadFees, sourceAssetProp, targetAssetProp])

  const prevApproveFee = useRef<O.Option<BaseAmount>>(O.none)

  const [approveFeeRD, approveFeeParamsUpdated] = useObservableState<FeeRD, ApproveParams>((approveFeeParam$) => {
    return approveFeeParam$.pipe(
      RxOp.switchMap((params) =>
        FP.pipe(
          approveFee$(params),
          liveData.map((fee) => {
            // store every successfully loaded fees
            prevApproveFee.current = O.some(fee)
            return fee
          })
        )
      )
    )
  }, RD.initial)

  const prevApproveParams = useRef<O.Option<ApproveParams>>(O.none)

  const approveFee: BaseAmount = useMemo(
    () =>
      FP.pipe(
        approveFeeRD,
        RD.toOption,
        O.alt(() => prevApproveFee.current),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [approveFeeRD]
  )

  // whenever `oApproveParams` has been updated,
  // `approveFeesParamsUpdated` needs to be called to update `approveFeesRD`
  useEffect(() => {
    FP.pipe(
      oApproveParams,
      // Do nothing if prev. and current router a the same
      O.filter((params) => !eqOApproveParams.equals(O.some(params), prevApproveParams.current)),
      // update ref
      O.map((params) => {
        prevApproveParams.current = O.some(params)
        return params
      }),
      // Trigger update for `approveFeesRD`
      O.map(approveFeeParamsUpdated)
    )
  }, [approveFeeParamsUpdated, oApproveParams, oPoolAddress])

  const reloadApproveFeesHandler = useCallback(() => {
    FP.pipe(oApproveParams, O.map(reloadApproveFee))
  }, [oApproveParams, reloadApproveFee])

  // Swap start time
  const [swapStartTime, setSwapStartTime] = useState<number>(0)

  const setSourceAsset = useCallback(
    async (asset: Asset) => {
      // delay to avoid render issues while switching
      await delay(100)

      FP.pipe(
        oTargetAsset,
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
    [onChangePath, oTargetAsset]
  )

  const setTargetAsset = useCallback(
    async (asset: Asset) => {
      // delay to avoid render issues while switching
      await delay(100)

      FP.pipe(
        oSourceAsset,
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
    [onChangePath, oSourceAsset]
  )

  const minAmountToSwapMax1e8: BaseAmount = useMemo(
    () =>
      Utils.minAmountToSwapMax1e8({
        swapFees,
        inAsset: sourceAssetProp,
        inAssetDecimal: sourceAssetDecimal,
        outAsset: targetAssetProp,
        poolsData
      }),
    [poolsData, sourceAssetDecimal, sourceAssetProp, swapFees, targetAssetProp]
  )

  const minAmountError = useMemo(() => {
    if (isZeroAmountToSwap) return false

    return amountToSwapMax1e8.lt(minAmountToSwapMax1e8)
  }, [amountToSwapMax1e8, isZeroAmountToSwap, minAmountToSwapMax1e8])

  const minAmountLabel = useMemo(
    () => (
      <Styled.MinAmountLabel color={minAmountError ? 'error' : 'normal'}>
        {`${intl.formatMessage({ id: 'common.min' })}: ${formatAssetAmountCurrency({
          asset: sourceAssetProp,
          amount: baseToAsset(minAmountToSwapMax1e8),
          trimZeros: true
        })}`}
      </Styled.MinAmountLabel>
    ),
    [intl, minAmountError, minAmountToSwapMax1e8, sourceAssetProp]
  )

  // Max amount to swap
  // depends on users balances of source asset
  // Decimal always <= 1e8 based
  const maxAmountToSwapMax1e8: BaseAmount = useMemo(() => {
    // make sure not logged in user can play around with swap
    if (unlockedWallet) return assetToBase(assetAmount(Number.MAX_SAFE_INTEGER, sourceAssetAmountMax1e8.decimal))

    return sourceAssetAmountMax1e8
  }, [unlockedWallet, sourceAssetAmountMax1e8])

  const setAmountToSwapMax1e8 = useCallback(
    (amountToSwap: BaseAmount) => {
      const newAmount = baseAmount(amountToSwap.amount(), maxAmountToSwapMax1e8.decimal)

      // dirty check - do nothing if prev. and next amounts are equal
      if (eqBaseAmount.equals(newAmount, amountToSwapMax1e8)) return {}

      const newAmountToSwap = newAmount.gt(maxAmountToSwapMax1e8) ? maxAmountToSwapMax1e8 : newAmount
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
    (percents: number) => {
      const amountFromPercentage = maxAmountToSwapMax1e8.amount().multipliedBy(percents / 100)
      return setAmountToSwapMax1e8(baseAmount(amountFromPercentage, sourceAssetAmountMax1e8.decimal))
    },
    [maxAmountToSwapMax1e8, setAmountToSwapMax1e8, sourceAssetAmountMax1e8.decimal]
  )

  const allAssets = useMemo((): Asset[] => availableAssets.map(({ asset }) => asset), [availableAssets])

  const assetSymbolsInWallet: O.Option<string[]> = useMemo(
    () => FP.pipe(oWalletBalances, O.map(A.map(({ asset }) => asset.symbol.toUpperCase()))),
    [oWalletBalances]
  )

  const allBalances = FP.pipe(
    oWalletBalances,
    O.map((balances) => filterWalletBalancesByAssets(balances, allAssets)),
    O.getOrElse(() => [] as WalletBalances)
  )

  const balancesToSwapFrom = useMemo((): WalletBalances => {
    const filteredBalances: WalletBalances = FP.pipe(
      allBalances,
      A.filter((balance) =>
        FP.pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(balance.asset.symbol.toUpperCase())),
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
          A.filter((balance) => !eqAsset.equals(balance.asset, source) && !eqAsset.equals(balance.asset, target))
        )
      ),
      O.getOrElse(() => allBalances)
    )
  }, [assetsToSwap, assetSymbolsInWallet, allBalances])

  const balancesToSwapTo = useMemo((): WalletBalances => {
    const allBalances = FP.pipe(
      oWalletBalances,
      O.getOrElse((): WalletBalances => [])
    )

    return FP.pipe(
      allAssets,
      A.filter((asset) =>
        FP.pipe(
          assetsToSwap,
          O.map(({ source, target }) => !eqAsset.equals(asset, source) && !eqAsset.equals(asset, target)),
          O.getOrElse((): boolean => false)
        )
      ),
      A.filterMap((availableAsset) =>
        FP.pipe(
          allBalances,
          // Looking for asset's balances. Possible duplications of assets caused by different WalletTypes
          A.filter(({ asset }) => eqAsset.equals(asset, availableAsset)),
          NEA.fromArray,
          O.alt(() =>
            /*
             * !!! IMPORTANT NOTE !!!
             * Right now this peace of code will work incorrectly in case
             * of adding another wallet types (e.g. Ledger).
             * TODO (@asgardex-team) play around with a way to handle different wallet-types
             * */
            FP.pipe(
              allBalances,
              // If there was not found any WalletBalance get the first asset with the
              // same chain and use its walletAddress as this is a single common wallet
              A.findFirst(({ asset }) => eqChain.equals(asset.chain, availableAsset.chain)),
              // And set available balance amount as Zero Value as user does not have any balances for this asset at all
              O.map((balance) => [
                {
                  asset: availableAsset,
                  walletAddress: balance.walletAddress,
                  amount: ZERO_BASE_AMOUNT
                }
              ])
            )
          )
        )
      ),
      A.flatten
    )
  }, [oWalletBalances, allAssets, assetsToSwap])

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
        disabled={unlockedWallet || hasHaltedChain}
      />
    )
  }, [
    unlockedWallet,
    amountToSwapMax1e8,
    sourceAssetAmountMax1e8,
    setAmountToSwapFromPercentValue,
    reloadFeesHandler,
    hasHaltedChain
  ])

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

  const sourceChainFeeError: boolean = useMemo(() => {
    // ignore error check by having zero amounts or min amount errors
    if (isZeroAmountToSwap || minAmountError) return false

    return Utils.minBalanceToSwap(swapFees).gt(sourceChainAssetAmount)
  }, [isZeroAmountToSwap, minAmountError, swapFees, sourceChainAssetAmount])

  const sourceChainFeeErrorLabel: JSX.Element = useMemo(() => {
    if (!sourceChainFeeError) {
      return <></>
    }

    const {
      inFee: { asset: inFeeAsset }
    } = swapFees

    return (
      <Styled.FeeErrorLabel key="sourceChainErrorLabel">
        {intl.formatMessage(
          { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
          {
            balance: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAssetProp.chain),
              amount: baseToAsset(sourceChainAssetAmount),
              trimZeros: true
            }),
            fee: formatAssetAmountCurrency({
              asset: inFeeAsset,
              trimZeros: true,
              amount: baseToAsset(Utils.minBalanceToSwap(swapFees))
            })
          }
        )}
      </Styled.FeeErrorLabel>
    )
  }, [sourceChainFeeError, swapFees, intl, sourceAssetProp.chain, sourceChainAssetAmount])

  // Helper to price target fees into source asset
  const outFeeInTargetAsset: BaseAmount = useMemo(() => {
    const {
      outFee: { amount: outFeeAmount, asset: outFeeAsset }
    } = swapFees

    // no pricing if target asset === target fee asset
    if (eqAsset.equals(targetAssetProp, outFeeAsset)) return outFeeAmount

    const oTargetFeeAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(outFeeAsset)])
    const oTargetAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(targetAssetProp)])

    return FP.pipe(
      sequenceTOption(oTargetFeeAssetPoolData, oTargetAssetPoolData),
      O.fold(
        () => ZERO_BASE_AMOUNT,
        ([targetFeeAssetPoolData, targetAssetPoolData]) =>
          // pool data are always 1e8 decimal based
          // and we have to convert fees to 1e8, too
          getValueOfAsset1InAsset2(to1e8BaseAmount(outFeeAmount), targetFeeAssetPoolData, targetAssetPoolData)
      )
    )
  }, [swapFees, targetAssetProp, poolsData])

  const swapResultLabel = useMemo(
    () => formatAssetAmount({ amount: baseToAsset(swapResultAmountMax1e8), trimZeros: true }),
    [swapResultAmountMax1e8]
  )

  const uiFees: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        swapFeesRD,
        RD.map(({ inFee }) => [
          { asset: inFee.asset, amount: inFee.amount },
          // price out fee in target asset
          { asset: targetAssetProp, amount: outFeeInTargetAsset }
        ])
      ),
    [swapFeesRD, targetAssetProp, outFeeInTargetAsset]
  )

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

  const uiApproveFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        approveFeeRD,
        RD.map((approveFee) => [{ asset: getChainAsset(sourceAssetProp.chain), amount: approveFee }])
      ),
    [approveFeeRD, sourceAssetProp.chain]
  )

  const isApproveFeeError = useMemo(() => {
    // ignore error check if we don't need to check allowance
    if (!needApprovement) return false

    return sourceChainAssetAmount.lt(approveFee)
  }, [needApprovement, sourceChainAssetAmount, approveFee])

  // sourceChainFeeErrorLabel

  const approveFeeErrorLabel: JSX.Element = useMemo(() => {
    if (
      !isApproveFeeError ||
      // Don't render error if walletBalances are still loading
      walletBalancesLoading
    )
      return <></>

    return (
      <Styled.FeeErrorLabel key="sourceChainErrorLabel">
        {intl.formatMessage(
          { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
          {
            balance: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAssetProp.chain),
              amount: baseToAsset(sourceChainAssetAmount),
              trimZeros: true
            }),
            fee: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAssetProp.chain),
              trimZeros: true,
              amount: baseToAsset(approveFee)
            })
          }
        )}
      </Styled.FeeErrorLabel>
    )
  }, [isApproveFeeError, walletBalancesLoading, intl, sourceAssetProp.chain, sourceChainAssetAmount, approveFee])

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

  const isApproved = useMemo(() => {
    if (!needApprovement) return true
    // ignore initial + loading states for `isApprovedState`
    if (RD.isInitial(isApprovedState) || RD.isPending(isApprovedState)) return true

    return (
      RD.isSuccess(approveState) ||
      FP.pipe(
        isApprovedState,
        // ignore other RD states and set to `true`
        // to avoid switch between approve and submit button
        // Submit button will still be disabled
        RD.getOrElse(() => true)
      )
    )
  }, [approveState, isApprovedState, needApprovement])

  const checkApprovedStatus = useCallback(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    const oNeedApprovement: O.Option<boolean> = FP.pipe(
      needApprovement,
      // `None` if needApprovement is `false`, no request then
      O.fromPredicate((v) => !!v)
    )
    const oTokenAddress: O.Option<string> = getEthTokenAddress(sourceAssetProp)

    // check approve status
    FP.pipe(
      sequenceTOption(oNeedApprovement, oRouterAddress, oTokenAddress),
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
    // check approved status
    checkApprovedStatus()
    // reload fees
    reloadFeesHandler()
  }, [
    checkApprovedStatus,
    initialAmountToSwapMax1e8,
    reloadFeesHandler,
    resetApproveState,
    resetIsApprovedState,
    resetSwapState,
    setAmountToSwapMax1e8
  ])

  /**
   * Callback whenever assets have been changed
   */
  useEffect(() => {
    let doReset = false
    // reset data whenever source asset has been changed
    if (!eqOAsset.equals(prevSourceAsset.current, O.some(sourceAssetProp))) {
      prevSourceAsset.current = O.some(sourceAssetProp)
      doReset = true
    }
    // reset data whenever target asset has been changed
    if (!eqOAsset.equals(prevTargetAsset.current, O.some(targetAssetProp))) {
      prevTargetAsset.current = O.some(targetAssetProp)
      doReset = true
    }
    // reset only once
    if (doReset) reset()

    // Note: useEffect does depends on `sourceAssetProp`, `targetAssetProp` - ignore other values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceAssetProp, targetAssetProp])

  const onSwitchAssets = useCallback(async () => {
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
  }, [assetsToSwap, onChangePath])

  const disableSubmit: boolean = useMemo(
    () =>
      hasHaltedChain ||
      unlockedWallet ||
      isZeroAmountToSwap ||
      walletBalancesLoading ||
      sourceChainFeeError ||
      RD.isPending(swapFeesRD) ||
      RD.isPending(approveState) ||
      minAmountError,
    [
      hasHaltedChain,
      unlockedWallet,
      isZeroAmountToSwap,
      walletBalancesLoading,
      sourceChainFeeError,
      swapFeesRD,
      approveState,
      minAmountError
    ]
  )

  const disableSubmitApprove = useMemo(
    () => isApproveFeeError || walletBalancesLoading || hasHaltedChain,

    [hasHaltedChain, isApproveFeeError, walletBalancesLoading]
  )

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
              onChange={setAmountToSwapMax1e8}
              onBlur={reloadFeesHandler}
              amount={amountToSwapMax1e8}
              maxAmount={maxAmountToSwapMax1e8}
              hasError={minAmountError}
              asset={sourceAssetProp}
              disabled={unlockedWallet}
            />
            {FP.pipe(
              oSourceAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <Styled.AssetSelect
                    onSelect={setSourceAsset}
                    asset={asset}
                    balances={balancesToSwapFrom}
                    network={network}
                  />
                )
              )
            )}
          </Styled.ValueItemContainer>
          {minAmountLabel}

          <Styled.ValueItemContainer className={'valueItemContainer-percent'}>
            <Styled.SliderContainer>{renderSlider}</Styled.SliderContainer>
            <Styled.SwapOutlined onClick={onSwitchAssets} />
          </Styled.ValueItemContainer>
          <Styled.ValueItemContainer className={'valueItemContainer-in'}>
            <Styled.InValueContainer>
              <Styled.InValueTitle>{intl.formatMessage({ id: 'swap.output' })}:</Styled.InValueTitle>
              <Styled.InValueLabel>{swapResultLabel}</Styled.InValueLabel>
            </Styled.InValueContainer>
            {FP.pipe(
              oTargetAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <Styled.AssetSelect
                    onSelect={setTargetAsset}
                    asset={asset}
                    balances={balancesToSwapTo}
                    network={network}
                  />
                )
              )
            )}
          </Styled.ValueItemContainer>
        </Styled.FormContainer>
      </Styled.ContentContainer>
      <Styled.SubmitContainer>
        {!isLocked(keystore) ? (
          isApproved ? (
            <>
              <Styled.SubmitButton
                color="success"
                sizevalue="xnormal"
                onClick={onSwapConfirmed}
                disabled={disableSubmit}>
                {intl.formatMessage({ id: 'common.swap' })}
              </Styled.SubmitButton>
              {!RD.isInitial(uiFees) && <Fees fees={uiFees} reloadFees={reloadFeesHandler} />}
              {sourceChainFeeErrorLabel}
            </>
          ) : (
            <>
              <Styled.SubmitButton
                sizevalue="xnormal"
                color="warning"
                disabled={disableSubmitApprove}
                onClick={onApprove}
                loading={RD.isPending(approveState)}>
                {intl.formatMessage({ id: 'common.approve' })}
              </Styled.SubmitButton>

              {!RD.isInitial(uiApproveFeesRD) && <Fees fees={uiApproveFeesRD} reloadFees={reloadApproveFeesHandler} />}
              {approveFeeErrorLabel}
              {renderApproveError}
            </>
          )
        ) : (
          <>
            <Styled.NoteLabel align="center">
              {!hasImportedKeystore(keystore)
                ? intl.formatMessage({ id: 'swap.note.nowallet' })
                : isLocked(keystore) && intl.formatMessage({ id: 'swap.note.lockedWallet' })}
            </Styled.NoteLabel>
            <Styled.SubmitButton sizevalue="xnormal" color="success" onClick={importWalletHandler}>
              {!hasImportedKeystore(keystore)
                ? intl.formatMessage({ id: 'wallet.imports.label' })
                : isLocked(keystore) && intl.formatMessage({ id: 'wallet.unlock.label' })}
            </Styled.SubmitButton>
          </>
        )}
      </Styled.SubmitContainer>
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
