import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData, getSwapMemo, getValueOfAsset1InAsset2 } from '@thorchain/asgardex-util'
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
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../const'
import { getEthTokenAddress, isEthAsset, isEthTokenAsset, isRuneNativeAsset } from '../../helpers/assetHelper'
import { getChainAsset, isEthChain } from '../../helpers/chainHelper'
import { eqAsset, eqBaseAmount, eqOAsset } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { LiveData } from '../../helpers/rx/liveData'
import { getWalletBalanceByAsset } from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { swap } from '../../routes/swap'
import { INITIAL_SWAP_STATE } from '../../services/chain/const'
import {
  SwapState,
  SwapParams,
  SwapStateHandler,
  SwapFeesHandler,
  LoadSwapFeesHandler,
  SwapFeesRD,
  SwapFeesParams,
  SwapFeesLD
} from '../../services/chain/types'
import { ApproveParams, IsApprovedRD } from '../../services/ethereum/types'
import { PoolAssetDetail, PoolAssetDetails } from '../../services/midgard/types'
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
import { CurrencyInfo } from '../currency'
import { PasswordModal } from '../modal/password'
import { TxModal } from '../modal/tx'
import { SwapAssets } from '../modal/tx/extra'
import { ViewTxButton } from '../uielements/button'
import { Fees, UIFeesRD } from '../uielements/fees'
import { Slider } from '../uielements/slider'
import * as Styled from './Swap.styles'
import { getSwapData, poolAssetDetailToAsset, pickPoolAsset, convertToBase8 } from './Swap.utils'

export type ConfirmSwapParams = { asset: Asset; amount: BaseAmount; memo: string }

export type SwapProps = {
  keystore: KeystoreState
  availableAssets: PoolAssetDetails
  sourceAsset: Asset
  targetAsset: Asset
  sourcePoolAddress: O.Option<string>
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
  sourcePoolRouter: O.Option<Address>
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: ApproveParams) => LiveData<ApiError, boolean>
}

export const Swap = ({
  keystore,
  availableAssets,
  sourceAsset: sourceAssetProp,
  targetAsset: targetAssetProp,
  sourcePoolAddress: oSourcePoolAddress,
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
  sourcePoolRouter,
  isApprovedERC20Token$,
  approveERC20Token$
}: SwapProps) => {
  const intl = useIntl()

  const prevSourceAsset = useRef<O.Option<Asset>>(O.none)
  const prevTargetAsset = useRef<O.Option<Asset>>(O.none)
  const prevSourcePoolRouter = useRef<O.Option<Address>>(O.none)

  // convert to hash map here instead of using getPoolDetail
  const poolData: Record<string, PoolData> = useMemo(() => getPoolDetailsHashMap(poolDetails, AssetRuneNative), [
    poolDetails
  ])

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
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oSourceAssetWB]
  )

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

  const [
    amountToSwap,
    _setAmountToSwap /* private - never set it directly, use setAmountToSwap() instead */
  ] = useState(baseAmount(0, sourceAssetAmount.decimal))

  const oSwapParams: O.Option<SwapParams> = useMemo(() => {
    // For RuneNative a `MsgNativeTx` is sent w/o the need for a pool address
    const oPoolAddress = isRuneNativeAsset(sourceAssetProp) ? O.some('') : oSourcePoolAddress
    return FP.pipe(
      sequenceTOption(assetsToSwap, oPoolAddress, targetWalletAddress),
      O.map(([{ source, target }, poolAddress, address]) => ({
        routerAddress: sourcePoolRouter,
        poolAddress,
        asset: source,
        amount: amountToSwap,
        memo: getSwapMemo({ asset: target, address })
      }))
    )
  }, [amountToSwap, assetsToSwap, oSourcePoolAddress, sourcePoolRouter, sourceAssetProp, targetWalletAddress])

  const swapData = useMemo(() => getSwapData(amountToSwap, sourceAsset, targetAsset, poolData), [
    amountToSwap,
    sourceAsset,
    targetAsset,
    poolData
  ])

  const oSwapFeesParams: O.Option<SwapFeesParams> = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oSwapParams, targetWalletAddress),
        O.map(([params, targetRecipient]) => ({
          source: {
            ...params,
            recipient: params.poolAddress
          },
          target: {
            asset: targetAssetProp,
            amount: swapData.swapResult,
            recipient: targetRecipient,
            routerAddress: O.some('')
          }
        }))
      ),
    [oSwapParams, swapData.swapResult, targetAssetProp, targetWalletAddress]
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
  const maxAmountToSwap: BaseAmount = useMemo(() => {
    // make sure not logged in user can play around with swap
    if (isLocked(keystore) || !hasImportedKeystore(keystore)) return assetToBase(assetAmount(Number.MAX_SAFE_INTEGER))

    // max amount for sourc chain asset
    const maxChainAssetAmount: BaseAmount = FP.pipe(
      RD.toOption(chainFeesRD),
      O.fold(
        // Ingnore fees and use balance of source chain asset for max.
        () => sourceChainAssetAmount,
        ({ source: sourceFee }) => {
          let max = sourceChainAssetAmount.amount().minus(sourceFee.amount())
          max = max.isGreaterThan(0) ? max : ZERO_BN
          return baseAmount(max, sourceChainAssetAmount.decimal)
        }
      )
    )
    return eqAsset.equals(sourceChainAsset, sourceAssetProp) ? maxChainAssetAmount : sourceAssetAmount
  }, [keystore, chainFeesRD, sourceChainAsset, sourceAssetProp, sourceAssetAmount, sourceChainAssetAmount])

  const setAmountToSwap = useCallback(
    (targetAmount: BaseAmount) => {
      if (eqBaseAmount.equals(targetAmount, amountToSwap)) return {}

      const newAmountToSwap = targetAmount.amount().isGreaterThan(maxAmountToSwap.amount())
        ? maxAmountToSwap
        : targetAmount

      /**
       * New object instance of `amountToSwap` is needed to make
       * AssetInput component react to the new value.
       * In case maxAmount has the same pointer
       * AssetInput will not be updated as a React-component
       * but native input element will change its
       * inner value and user will see inappropriate value
       */
      _setAmountToSwap({ ...newAmountToSwap })
    },
    [maxAmountToSwap, amountToSwap]
  )

  const setAmountToSwapFromPercentValue = useCallback(
    (percents) => {
      const amountFromPercentage = maxAmountToSwap.amount().multipliedBy(Number(percents) / 100)
      return setAmountToSwap(baseAmount(amountFromPercentage, sourceAssetAmount.decimal))
    },
    [maxAmountToSwap, setAmountToSwap, sourceAssetAmount.decimal]
  )

  const allAssets = useMemo((): Asset[] => availableAssets.map(({ asset }) => asset), [availableAssets])

  const assetSymbolsInWallet: O.Option<string[]> = useMemo(
    () => FP.pipe(walletBalances, O.map(A.map(({ asset }) => asset.symbol.toUpperCase()))),
    [walletBalances]
  )

  const assetsToSwapFrom = useMemo((): Asset[] => {
    const filteredAssets: Asset[] = FP.pipe(
      allAssets,
      A.filter((asset) =>
        FP.pipe(
          assetSymbolsInWallet,
          O.map((symbols) => symbols.includes(asset.symbol)),
          O.getOrElse((): boolean => false)
        )
      ),
      (assets) => (assets.length ? assets : allAssets)
    )

    return FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        FP.pipe(
          filteredAssets,
          A.filter((asset) => asset.symbol !== source.symbol && asset.symbol !== target.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetsToSwap, assetSymbolsInWallet])

  const assetsToSwapTo = useMemo((): Asset[] => {
    return FP.pipe(
      assetsToSwap,
      O.map(({ source, target }) =>
        FP.pipe(
          allAssets,
          A.filter((asset) => asset.symbol !== source.symbol && asset.symbol !== target.symbol)
        )
      ),
      O.getOrElse(() => allAssets)
    )
  }, [allAssets, assetsToSwap])

  const balanceLabel = useMemo(
    () => `${intl.formatMessage({ id: 'swap.balance' })}: ${formatBN(baseToAsset(sourceAssetAmount).amount())}`,
    [sourceAssetAmount, intl]
  )

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const onSwapConfirmed = useCallback(() => {
    setShowPasswordModal(true)
  }, [setShowPasswordModal])

  const renderSlider = useMemo(
    () =>
      FP.pipe(
        oSourceAssetWB,
        O.map((assetWB) => {
          const percentage = amountToSwap.amount().dividedBy(assetWB.amount.amount()).multipliedBy(100).toNumber()
          return (
            <Slider
              key={'swap percentage slider'}
              value={percentage}
              onChange={setAmountToSwapFromPercentValue}
              onAfterChange={reloadFeesHandler}
              tooltipVisible={true}
              withLabel={true}
              tooltipPlacement={'top'}
            />
          )
        }),
        O.toNullable
      ),
    [oSourceAssetWB, amountToSwap, setAmountToSwapFromPercentValue, reloadFeesHandler]
  )

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
            source={{ asset: sourceAsset, amount: amountToSwap }}
            target={{ asset: targetAsset, amount: swapData.swapResult }}
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
    swapData.swapResult,
    swapData.slip,
    amountToSwap,
    swapState.swap,
    swapState.step,
    swapState.stepsTotal,
    intl,
    network
  ])

  const onFinishTxModal = useCallback(() => {
    resetSwapState()
    reloadBalances()
    setAmountToSwap(ZERO_BASE_AMOUNT)
  }, [resetSwapState, reloadBalances, setAmountToSwap])

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
      RD.getOrElse(() => ({ source: ZERO_BASE_AMOUNT, target: ZERO_BASE_AMOUNT })),
      ({ source }) => sourceChainAssetAmount.amount().minus(source.amount()).isNegative()
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
                amount: baseToAsset(fees.source)
              })
            }
          )}
        </Styled.BalanceErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [sourceChainError, chainFeesRD, intl, sourceAssetProp, sourceAssetAmount, sourceChainAsset])

  const targetChainFeeAmountInTargetAsset: BaseAmount = useMemo(() => {
    const fees = FP.pipe(
      chainFeesRD,
      RD.getOrElse(() => ({ source: ZERO_BASE_AMOUNT, target: ZERO_BASE_AMOUNT }))
    )

    return FP.pipe(
      targetAsset,
      O.map((asset) => {
        const chainAsset = getChainAsset(asset.chain)
        const chainAssetPoolData: PoolData | undefined = poolData[assetToString(chainAsset)]
        const assetPoolData: PoolData | undefined = poolData[assetToString(asset)]
        if (!chainAssetPoolData || !assetPoolData) {
          return ZERO_BASE_AMOUNT
        }

        return eqAsset.equals(chainAsset, asset)
          ? fees.target
          : getValueOfAsset1InAsset2(convertToBase8(fees.target), chainAssetPoolData, assetPoolData)
      }),
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )
  }, [chainFeesRD, targetAsset, poolData])

  const targetChainFeeError = useMemo((): boolean => {
    // check zero swap amounts and status of `pending assets`
    if (amountToSwap.amount().isZero() || pendingSwitchAssets) return false

    const targetFee = FP.pipe(targetChainFeeAmountInTargetAsset, baseToAsset, (assetAmount) => assetAmount.amount())
    return swapData.swapResult.amount().minus(targetFee).isNegative()
  }, [amountToSwap, pendingSwitchAssets, targetChainFeeAmountInTargetAsset, swapData.swapResult])

  const swapResultLabel = useMemo(
    () =>
      FP.pipe(
        O.some(formatAssetAmount({ amount: baseToAsset(swapData.swapResult), trimZeros: true })),
        O.getOrElse(() => formatBN(ZERO_BN))
      ),
    [swapData]
  )

  const targetChainFeeErrorLabel = useMemo(() => {
    if (!targetChainFeeError) {
      return null
    }

    const feeAssetAmount = baseToAsset(targetChainFeeAmountInTargetAsset)

    return FP.pipe(
      targetAsset,
      O.map((asset) => (
        <Styled.ErrorLabel key="targetChainFeeErrorLabel">
          {intl.formatMessage(
            { id: 'swap.errors.amount.outputShouldCoverChainFee' },
            {
              fee: formatAssetAmountCurrency({ amount: feeAssetAmount, asset, trimZeros: true }),
              amount: swapResultLabel
            }
          )}
        </Styled.ErrorLabel>
      )),
      O.getOrElse(() => <></>)
    )
  }, [targetChainFeeError, targetChainFeeAmountInTargetAsset, intl, targetAsset, swapResultLabel])

  const fees: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        sequenceTRD(chainFeesRD, RD.success(targetChainFeeAmountInTargetAsset)),
        RD.map(([chainFee, targetFee]) => [
          { asset: getChainAsset(sourceAssetProp.chain), amount: chainFee.source },
          { asset: targetAssetProp, amount: targetFee }
        ])
      ),
    [chainFeesRD, targetChainFeeAmountInTargetAsset, sourceAssetProp.chain, targetAssetProp]
  )

  const isSwapDisabled: boolean = useMemo(() => amountToSwap.amount().isZero() || FP.pipe(walletBalances, O.isNone), [
    walletBalances,
    amountToSwap
  ])

  const {
    state: approveState,
    reset: resetApproveState,
    subscribe: subscribeApproveState
  } = useSubscriptionState<TxHashRD>(RD.initial)

  const onApprove = () => {
    FP.pipe(
      sequenceTOption(sourcePoolRouter, getEthTokenAddress(sourceAssetProp)),
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
    // check approve status
    FP.pipe(
      sequenceTOption(
        O.fromPredicate((v) => !!v)(needApprovement), // `None` if needApprovement is `false`, no request then
        sourcePoolRouter,
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
  }, [isApprovedERC20Token$, needApprovement, sourceAssetProp, sourcePoolRouter, subscribeIsApprovedState])

  const reset = useCallback(() => {
    // reset swap state
    resetSwapState()
    // reset approve state
    resetApproveState()
    // reset isApproved state
    resetIsApprovedState()
    // zero amount to swap
    setAmountToSwap(ZERO_BASE_AMOUNT)
    // reload fees
    reloadFeesHandler()
    // check approved status
    checkApprovedStatus()
  }, [checkApprovedStatus, reloadFeesHandler, resetApproveState, resetIsApprovedState, resetSwapState, setAmountToSwap])

  useEffect(() => {
    // reset data whenever
    if (!eqOAsset.equals(prevSourceAsset.current, O.some(sourceAssetProp))) {
      prevSourceAsset.current = O.some(sourceAssetProp)
      reset()
    }
    // reset data whenever
    if (!eqOAsset.equals(prevTargetAsset.current, O.some(targetAssetProp))) {
      prevTargetAsset.current = O.some(targetAssetProp)
      reset()
    }
    if (prevSourcePoolRouter.current !== sourcePoolRouter) {
      prevSourcePoolRouter.current = sourcePoolRouter
      checkApprovedStatus()
    }
  }, [checkApprovedStatus, reset, setAmountToSwap, sourceAssetProp, sourcePoolRouter, targetAssetProp])

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
              onChange={setAmountToSwap}
              onBlur={reloadFeesHandler}
              amount={amountToSwap}
              hasError={sourceChainError || targetChainFeeError}
            />
            {FP.pipe(
              sourceAsset,
              O.fold(
                () => <></>,
                (asset) => (
                  <Styled.AssetSelect
                    onSelect={setSourceAsset}
                    asset={asset}
                    assets={assetsToSwapFrom}
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
                    assets={assetsToSwapTo}
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
          {targetChainFeeErrorLabel}
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
