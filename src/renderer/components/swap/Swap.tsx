import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  assetToString,
  baseToAsset,
  BaseAmount,
  baseAmount,
  formatAssetAmount,
  formatAssetAmountCurrency,
  delay,
  Chain,
  assetToBase,
  assetAmount,
  chainToString,
  Address
} from '@xchainjs/xchain-util'
import { Row } from 'antd'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../const'
import {
  getEthTokenAddress,
  isEthAsset,
  isEthTokenAsset,
  max1e8BaseAmount,
  convertBaseAmountDecimal,
  isChainAsset,
  to1e8BaseAmount
} from '../../helpers/assetHelper'
import { getChainAsset, isBchChain, isBtcChain, isDogeChain, isEthChain, isLtcChain } from '../../helpers/chainHelper'
import { unionAssets } from '../../helpers/fp/array'
import { eqAsset, eqBaseAmount, eqOAsset, eqOApproveParams, eqAddress, eqOAddress } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption } from '../../helpers/fpHelpers'
import * as PoolHelpers from '../../helpers/poolHelper'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import {
  filterWalletBalancesByAssets,
  getWalletBalanceByAssetAndWalletType,
  hasLedgerInBalancesByAsset
} from '../../helpers/walletHelper'
import { useSubscriptionState } from '../../hooks/useSubscriptionState'
import { swap } from '../../routes/pools'
import { ChangeSlipToleranceHandler } from '../../services/app/types'
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
import { AddressValidationAsync, GetExplorerTxUrl, OpenExplorerTxUrl } from '../../services/clients'
import {
  ApproveFeeHandler,
  ApproveParams,
  IsApprovedRD,
  IsApproveParams,
  LoadApproveFeeHandler
} from '../../services/ethereum/types'
import { PoolAssetDetail, PoolAssetDetails, PoolAddress, PoolsDataMap } from '../../services/midgard/types'
import { MimirHalt } from '../../services/thorchain/types'
import {
  ApiError,
  KeystoreState,
  TxHashLD,
  TxHashRD,
  ValidatePasswordHandler,
  BalancesState,
  WalletBalance,
  WalletBalances
} from '../../services/wallet/types'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AssetWithDecimal, SlipTolerance } from '../../types/asgardex'
import { CurrencyInfo } from '../currency'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../modal/confirmation'
import { TxModal } from '../modal/tx'
import { SwapAssets } from '../modal/tx/extra'
import { LoadingView } from '../shared/loading'
import { AssetSelect } from '../uielements/assets/assetSelect'
import { FlatButton, ViewTxButton } from '../uielements/button'
import { WalletTypeLabel } from '../uielements/common/Common.styles'
import { Fees, UIFeesRD } from '../uielements/fees'
import { InfoIcon } from '../uielements/info'
import { CopyLabel } from '../uielements/label'
import { Slider } from '../uielements/slider'
import { EditableAddress } from './EditableAddress'
import * as Styled from './Swap.styles'
import { AssetsToSwap, SwapData } from './Swap.types'
import * as Utils from './Swap.utils'

export type SwapProps = {
  keystore: KeystoreState
  availableAssets: PoolAssetDetails
  assets: { inAsset: AssetWithDecimal; outAsset: AssetWithDecimal }
  sourceWalletAddress: O.Option<Address>
  sourceLedgerAddress: O.Option<Address>
  poolAddress: O.Option<PoolAddress>
  swap$: SwapStateHandler
  poolsData: PoolsDataMap
  walletBalances: Pick<BalancesState, 'balances' | 'loading'>
  goToTransaction: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  reloadFees: ReloadSwapFeesHandler
  reloadBalances: FP.Lazy<void>
  fees$: SwapFeesHandler
  reloadApproveFee: LoadApproveFeeHandler
  approveFee$: ApproveFeeHandler
  targetWalletAddress: O.Option<Address>
  targetLedgerAddress: O.Option<Address>
  onChangePath: (path: string) => void
  network: Network
  slipTolerance: SlipTolerance
  changeSlipTolerance: ChangeSlipToleranceHandler
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: IsApproveParams) => LiveData<ApiError, boolean>
  importWalletHandler: FP.Lazy<void>
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  clickAddressLinkHandler: (address: Address) => void
  addressValidator: AddressValidationAsync
}

export const Swap = ({
  keystore,
  availableAssets,
  assets: { inAsset: sourceAssetWD, outAsset: targetAssetWD },
  sourceWalletAddress: oInitialSourceWalletAddress,
  sourceLedgerAddress: oSourceLedgerAddress,
  poolAddress: oPoolAddress,
  swap$,
  poolsData,
  walletBalances,
  goToTransaction,
  getExplorerTxUrl,
  validatePassword$,
  reloadFees,
  reloadBalances = FP.constVoid,
  fees$,
  targetWalletAddress: oInitialTargetWalletAddress,
  targetLedgerAddress: oTargetLedgerAddress,
  onChangePath,
  network,
  slipTolerance,
  changeSlipTolerance,
  isApprovedERC20Token$,
  approveERC20Token$,
  reloadApproveFee,
  approveFee$,
  importWalletHandler,
  haltedChains,
  mimirHalt,
  clickAddressLinkHandler,
  addressValidator
}: SwapProps) => {
  const intl = useIntl()

  const lockedWallet = useMemo(() => isLocked(keystore) || !hasImportedKeystore(keystore), [keystore])

  const [oSourceWalletAddress, setSourceWalletAddress] = useState<O.Option<Address>>(oInitialSourceWalletAddress)

  // Update state needed - initial walletAddress is loaded async and can be different at first run
  useEffect(() => {
    setSourceWalletAddress(oInitialSourceWalletAddress)
  }, [oInitialSourceWalletAddress])

  const [oTargetWalletAddress, setTargetWalletAddress] = useState<O.Option<Address>>(oInitialTargetWalletAddress)
  const [editableTargetWalletAddress, setEditableTargetWalletAddress] =
    useState<O.Option<Address>>(oInitialTargetWalletAddress)

  // Update state needed - initial target walletAddress is loaded async and can be different at first run
  useEffect(() => {
    setTargetWalletAddress(oInitialTargetWalletAddress)
    setEditableTargetWalletAddress(oInitialTargetWalletAddress)
  }, [oInitialTargetWalletAddress])

  const { balances: oWalletBalances, loading: walletBalancesLoading } = walletBalances

  const { asset: sourceAssetProp, decimal: sourceAssetDecimal } = sourceAssetWD
  const { asset: targetAssetProp, decimal: targetAssetDecimal } = targetAssetWD

  // ZERO `BaseAmount` for target Asset - original decimal
  const zeroTargetBaseAmountMax = useMemo(() => baseAmount(0, targetAssetDecimal), [targetAssetDecimal])

  // ZERO `BaseAmount` for target Asset <= 1e8
  const zeroTargetBaseAmountMax1e8 = useMemo(() => max1e8BaseAmount(zeroTargetBaseAmountMax), [zeroTargetBaseAmountMax])

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

  const [useSourceAssetLedger, setUseSourceAssetLedger] = useState(false)
  const [useTargetAssetLedger, setUseTargetAssetLedger] = useState(false)

  const oTargetAddress: O.Option<Address> = useTargetAssetLedger ? oTargetLedgerAddress : oTargetWalletAddress

  const disableAllPoolActions = useCallback(
    (chain: Chain) => PoolHelpers.disableAllActions({ chain, haltedChains, mimirHalt }),
    [haltedChains, mimirHalt]
  )
  const disableTradingPoolActions = useCallback(
    (chain: Chain) => PoolHelpers.disableTradingActions({ chain, haltedChains, mimirHalt }),
    [haltedChains, mimirHalt]
  )

  const [customAddressEditActive, setCustomAddressEditActive] = useState(false)

  const disableSwapAction = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oSourceAsset, oTargetAsset),
        O.map(
          ([{ chain: sourceChain }, { chain: targetChain }]) =>
            disableAllPoolActions(sourceChain) ||
            disableTradingPoolActions(sourceChain) ||
            disableAllPoolActions(targetChain) ||
            disableTradingPoolActions(targetChain) ||
            customAddressEditActive
        ),
        O.getOrElse(() => true)
      ),
    [customAddressEditActive, disableAllPoolActions, disableTradingPoolActions, oSourceAsset, oTargetAsset]
  )

  const assetsToSwap: O.Option<AssetsToSwap> = useMemo(
    () => sequenceSOption({ source: oSourceAsset, target: oTargetAsset }),
    [oSourceAsset, oTargetAsset]
  )

  // Available assets are assets of available pools only
  const allAssets = useMemo((): Asset[] => availableAssets.map(({ asset }) => asset), [availableAssets])

  const allBalances: WalletBalances = useMemo(
    () =>
      FP.pipe(
        oWalletBalances,
        O.map((balances) => filterWalletBalancesByAssets(balances, allAssets)),
        O.getOrElse<WalletBalances>(() => [])
      ),
    [allAssets, oWalletBalances]
  )

  const hasSourceAssetLedger = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.map((asset) => hasLedgerInBalancesByAsset(asset, allBalances)),
        O.getOrElse(() => false)
      ),
    [oSourceAsset, allBalances]
  )

  const hasTargetAssetLedger = useMemo(() => O.isSome(oTargetLedgerAddress), [oTargetLedgerAddress])

  const oTargetWalletType: O.Option<WalletType> = useMemo(() => {
    // Check for Ledger
    if (hasTargetAssetLedger && eqOAddress.equals(editableTargetWalletAddress, oTargetLedgerAddress)) {
      return O.some('ledger')
    }
    // Check for keystore
    if (
      O.isSome(oInitialTargetWalletAddress) &&
      eqOAddress.equals(editableTargetWalletAddress, oInitialTargetWalletAddress)
    ) {
      return O.some('keystore')
    }
    // unknown type
    return O.none
  }, [editableTargetWalletAddress, hasTargetAssetLedger, oInitialTargetWalletAddress, oTargetLedgerAddress])

  const sourceWalletType: WalletType = useMemo(
    () => (useSourceAssetLedger ? 'ledger' : 'keystore'),
    [useSourceAssetLedger]
  )

  // `AssetWB` of source asset - which might be none (user has no balances for this asset or wallet is locked)
  const oSourceAssetWB: O.Option<WalletBalance> = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.chain((asset) => {
          const oWalletBalances = NEA.fromArray(allBalances)
          return getWalletBalanceByAssetAndWalletType({
            oWalletBalances,
            asset,
            walletType: sourceWalletType
          })
        })
      ),
    [oSourceAsset, allBalances, sourceWalletType]
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
        getWalletBalanceByAssetAndWalletType({
          oWalletBalances,
          asset: sourceChainAsset,
          walletType: sourceWalletType
        }),
        O.map(({ amount }) => amount),
        O.getOrElse(() => baseAmount(0, sourceAssetDecimal))
      ),
    [oWalletBalances, sourceAssetDecimal, sourceChainAsset, sourceWalletType]
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

  // Helper to price target fees into source asset - original decimal
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
        () => zeroTargetBaseAmountMax,
        ([targetFeeAssetPoolData, targetAssetPoolData]) => {
          // pool data are always 1e8 decimal based
          // and we have to convert fees to 1e8, too
          const amount1e8 = getValueOfAsset1InAsset2(
            to1e8BaseAmount(outFeeAmount),
            targetFeeAssetPoolData,
            targetAssetPoolData
          )
          // convert fee amount back into original decimal
          return convertBaseAmountDecimal(amount1e8, targetAssetDecimal)
        }
      )
    )
  }, [swapFees, targetAssetProp, poolsData, zeroTargetBaseAmountMax, targetAssetDecimal])

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
    // 1. Convert `swapResult` (1e8) to original decimal of target asset (original decimal might be < 1e8)
    const swapResultAmount = convertBaseAmountDecimal(swapData.swapResult, targetAssetDecimal)
    // 2. We still need to make sure `swapResult` is <= 1e8
    const swapResultAmountMax1e8 = max1e8BaseAmount(swapResultAmount)
    // 3. Deduct outbound fee from result
    const outFeeMax1e8 = max1e8BaseAmount(outFeeInTargetAsset)
    const resultMax1e8 = swapResultAmountMax1e8.minus(outFeeMax1e8)
    // don't show negative results
    return resultMax1e8.gt(zeroTargetBaseAmountMax1e8) ? resultMax1e8 : zeroTargetBaseAmountMax1e8
  }, [outFeeInTargetAsset, swapData.swapResult, targetAssetDecimal, zeroTargetBaseAmountMax1e8])

  // Disable slippage selection temporary for Ledger/BTC (see https://github.com/thorchain/asgardex-electron/issues/2068)
  const disableSlippage = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.map(
          ({ chain }) =>
            (isBtcChain(chain) || isLtcChain(chain) || isBchChain(chain) || isDogeChain(chain)) && useSourceAssetLedger
        ),
        O.getOrElse(() => false)
      ),
    [useSourceAssetLedger, oSourceAsset]
  )

  const swapLimit1e8: O.Option<BaseAmount> = useMemo(() => {
    // Disable slippage protection temporary for Ledger/BTC (see https://github.com/thorchain/asgardex-electron/issues/2068)
    return !disableSlippage && swapResultAmountMax1e8.gt(zeroTargetBaseAmountMax1e8)
      ? O.some(Utils.getSwapLimit1e8(swapResultAmountMax1e8, slipTolerance))
      : O.none
  }, [disableSlippage, slipTolerance, swapResultAmountMax1e8, zeroTargetBaseAmountMax1e8])

  const oSwapParams: O.Option<SwapTxParams> = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(assetsToSwap, oPoolAddress, oTargetAddress, oSourceAssetWB),
        O.map(([{ source, target }, poolAddress, address, { walletType, walletAddress, walletIndex, hdMode }]) => {
          const memo = getSwapMemo({
            asset: target,
            address,
            limit: O.toUndefined(swapLimit1e8) // limit needs to be in 1e8
          })
          return {
            poolAddress,
            asset: source,
            // Decimal needs to be converted back for using orginal decimal of source asset
            amount: convertBaseAmountDecimal(amountToSwapMax1e8, sourceAssetDecimal),
            memo,
            walletType,
            sender: walletAddress,
            walletIndex,
            hdMode
          }
        })
      ),
    [assetsToSwap, oPoolAddress, oTargetAddress, oSourceAssetWB, swapLimit1e8, amountToSwapMax1e8, sourceAssetDecimal]
  )

  const isCausedSlippage = useMemo(() => swapData.slip.toNumber() > slipTolerance, [swapData.slip, slipTolerance])

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

  const oApproveParams: O.Option<ApproveParams> = useMemo(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    const oTokenAddress: O.Option<string> = getEthTokenAddress(sourceAssetProp)

    const oNeedApprovement: O.Option<boolean> = FP.pipe(
      needApprovement,
      // `None` if needApprovement is `false`, no request then
      O.fromPredicate((v) => !!v)
    )

    return FP.pipe(
      sequenceTOption(oNeedApprovement, oTokenAddress, oRouterAddress, oSourceAssetWB),
      O.map(([_, tokenAddress, routerAddress, { walletAddress, walletIndex, walletType, hdMode }]) => ({
        network,
        spenderAddress: routerAddress,
        contractAddress: tokenAddress,
        fromAddress: walletAddress,
        walletIndex,
        hdMode,
        walletType
      }))
    )
  }, [needApprovement, network, oPoolAddress, oSourceAssetWB, sourceAssetProp])

  // Reload balances at `onMount`
  useEffect(() => {
    reloadBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  // State for values of `isApprovedERC20Token$`
  const {
    state: isApprovedState,
    reset: resetIsApprovedState,
    subscribe: subscribeIsApprovedState
  } = useSubscriptionState<IsApprovedRD>(RD.initial)

  const checkApprovedStatus = useCallback(
    ({ contractAddress, spenderAddress, fromAddress }: ApproveParams) => {
      subscribeIsApprovedState(
        isApprovedERC20Token$({
          contractAddress,
          spenderAddress,
          fromAddress
        })
      )
    },
    [isApprovedERC20Token$, subscribeIsApprovedState]
  )

  // whenever `oApproveParams` has been updated,
  // `approveFeeParamsUpdated` needs to be called to update `approveFeesRD`
  // + `checkApprovedStatus` needs to be called
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
      // Trigger update for `approveFeesRD` + `checkApprove`
      O.map((params) => {
        approveFeeParamsUpdated(params)
        checkApprovedStatus(params)
        return true
      })
    )
  }, [approveFeeParamsUpdated, checkApprovedStatus, oApproveParams, oPoolAddress])

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
    [oSourceAsset, onChangePath]
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

  const renderMinAmount = useMemo(
    () => (
      <Styled.MinAmountContainer>
        <Styled.MinAmountLabel color={minAmountError ? 'error' : 'gray'}>
          {`${intl.formatMessage({ id: 'common.min' })}: ${formatAssetAmountCurrency({
            asset: sourceAssetProp,
            amount: baseToAsset(minAmountToSwapMax1e8),
            trimZeros: true
          })}`}
        </Styled.MinAmountLabel>
        <InfoIcon
          color={minAmountError ? 'error' : 'primary'}
          tooltip={intl.formatMessage({ id: 'swap.min.amount.info' })}
        />
      </Styled.MinAmountContainer>
    ),
    [intl, minAmountError, minAmountToSwapMax1e8, sourceAssetProp]
  )

  // Max amount to swap
  // depends on users balances of source asset
  // Decimal always <= 1e8 based
  const maxAmountToSwapMax1e8: BaseAmount = useMemo(() => {
    if (lockedWallet) return assetToBase(assetAmount(Number.MAX_SAFE_INTEGER, sourceAssetAmountMax1e8.decimal))

    // In case of chain asset
    // We are substracting fee from source asset
    // In other cases ERC20/BEP20
    // max value of token can be allocated for swap
    if (isChainAsset(sourceChainAsset))
      return Utils.maxAmountToSwapMax1e8(sourceAssetAmountMax1e8, swapFees.inFee.amount)

    return sourceAssetAmountMax1e8
  }, [lockedWallet, sourceAssetAmountMax1e8, sourceChainAsset, swapFees])

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

  /**
   * Selectable source assets to swap from.
   *
   * Based on users balances.
   * Zero balances are ignored.
   * Duplications of assets are merged.
   */
  const selectableSourceAssets: Asset[] = useMemo(
    () =>
      FP.pipe(
        assetsToSwap,
        O.map(({ source, target }) =>
          FP.pipe(
            allBalances,
            // get asset
            A.map(({ asset }) => asset),
            // Ignore already selected source / target assets
            A.filter((asset) => !eqAsset.equals(asset, source) && !eqAsset.equals(asset, target)),
            // Merge duplications
            (assets) => unionAssets(assets)(assets)
          )
        ),
        O.getOrElse<Asset[]>(() => [])
      ),
    [assetsToSwap, allBalances]
  )

  /**
   * Selectable target assets to swap to.
   *
   * Based on available pool assets.
   * Duplications of assets are merged.
   */
  const selectableTargetAssets = useMemo(
    (): Asset[] =>
      FP.pipe(
        assetsToSwap,
        O.map(({ source, target }) =>
          FP.pipe(
            allAssets,
            // Ignore already selected source / target assets
            A.filter((asset) => !eqAsset.equals(asset, source) && !eqAsset.equals(asset, target)),
            // Merge duplications
            (assets) => unionAssets(assets)(assets)
          )
        ),
        O.getOrElse<Asset[]>(() => [])
      ),
    [allAssets, assetsToSwap]
  )

  type ModalState = 'swap' | 'approve' | 'none'
  const [showPasswordModal, setShowPasswordModal] = useState<ModalState>('none')
  const [showLedgerModal, setShowLedgerModal] = useState<ModalState>('none')

  const submitSwapTx = useCallback(() => {
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
  }, [oSwapParams, subscribeSwapState, swap$])

  const {
    state: approveState,
    reset: resetApproveState,
    subscribe: subscribeApproveState
  } = useSubscriptionState<TxHashRD>(RD.initial)

  const submitApproveTx = useCallback(() => {
    FP.pipe(
      oApproveParams,
      O.map(({ walletIndex, walletType, hdMode, contractAddress, spenderAddress, fromAddress }) =>
        subscribeApproveState(
          approveERC20Token$({
            network,
            contractAddress,
            spenderAddress,
            fromAddress,
            walletIndex,
            hdMode,
            walletType
          })
        )
      )
    )
  }, [approveERC20Token$, network, oApproveParams, subscribeApproveState])

  const onSubmit = useCallback(() => {
    if (useSourceAssetLedger) {
      setShowLedgerModal('swap')
    } else {
      setShowPasswordModal('swap')
    }
  }, [setShowLedgerModal, useSourceAssetLedger])

  const renderSlider = useMemo(() => {
    const percentage = lockedWallet
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
        disabled={lockedWallet || disableSwapAction}
      />
    )
  }, [
    lockedWallet,
    amountToSwapMax1e8,
    sourceAssetAmountMax1e8,
    setAmountToSwapFromPercentValue,
    reloadFeesHandler,
    disableSwapAction
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

    const oTxHash = FP.pipe(
      sequenceTOption(oSourceAsset, RD.toOption(swapTx)),
      // Note: As long as we link to `viewblock` to open tx details in a browser,
      // `0x` needs to be removed from tx hash in case of ETH
      // @see https://github.com/thorchain/asgardex-electron/issues/1787#issuecomment-931934508
      O.map(([{ chain }, txHash]) => (isEthChain(chain) ? txHash.replace(/0x/i, '') : txHash))
    )

    return (
      <TxModal
        title={txModalTitle}
        onClose={resetSwapState}
        onFinish={onFinishTxModal}
        startTime={swapStartTime}
        txRD={swap}
        extraResult={
          <ViewTxButton
            txHash={oTxHash}
            onClick={goToTransaction}
            txUrl={FP.pipe(oTxHash, O.chain(getExplorerTxUrl))}
          />
        }
        timerValue={timerValue}
        extra={extraTxModalContent}
      />
    )
  }, [
    extraTxModalContent,
    getExplorerTxUrl,
    goToTransaction,
    intl,
    oSourceAsset,
    onFinishTxModal,
    resetSwapState,
    swapStartTime,
    swapState
  ])

  const renderPasswordConfirmationModal = useMemo(() => {
    const onSuccess = () => {
      if (showPasswordModal === 'swap') submitSwapTx()
      if (showPasswordModal === 'approve') submitApproveTx()
      setShowPasswordModal('none')
    }
    const onClose = () => {
      setShowPasswordModal('none')
    }
    const render = showPasswordModal === 'swap' || showPasswordModal === 'approve'
    return (
      render && (
        <WalletPasswordConfirmationModal
          onSuccess={onSuccess}
          onClose={onClose}
          validatePassword$={validatePassword$}
        />
      )
    )
  }, [showPasswordModal, submitApproveTx, submitSwapTx, validatePassword$])

  const renderLedgerConfirmationModal = useMemo(() => {
    const visible = showLedgerModal === 'swap' || showLedgerModal === 'approve'
    return FP.pipe(
      oSourceAsset,
      O.map((asset) => {
        const onClose = () => {
          setShowLedgerModal('none')
        }

        const onSucceess = () => {
          if (showLedgerModal === 'swap') submitSwapTx()
          if (showLedgerModal === 'approve') submitApproveTx()
          setShowLedgerModal('none')
        }

        const chainAsString = chainToString(asset.chain)
        const txtNeedsConnected = intl.formatMessage(
          {
            id: 'ledger.needsconnected'
          },
          { chain: chainAsString }
        )

        const description1 =
          // extra info for ERC20 assets only
          isEthChain(asset.chain) && !isEthAsset(asset)
            ? `${txtNeedsConnected} ${intl.formatMessage(
                {
                  id: 'ledger.blindsign'
                },
                { chain: chainAsString }
              )}`
            : txtNeedsConnected

        const description2 = intl.formatMessage({ id: 'ledger.sign' })

        return (
          <LedgerConfirmationModal
            key="leder-conf-modal"
            network={network}
            onSuccess={onSucceess}
            onClose={onClose}
            visible={visible}
            chain={asset.chain}
            description1={description1}
            description2={description2}
            addresses={FP.pipe(
              oSwapParams,
              O.chain(({ poolAddress, sender }) => {
                const recipient = poolAddress.address
                if (useSourceAssetLedger) return O.some({ recipient, sender })
                return O.none
              })
            )}
          />
        )
      }),
      O.toNullable
    )
  }, [intl, network, oSourceAsset, oSwapParams, showLedgerModal, submitApproveTx, submitSwapTx, useSourceAssetLedger])

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
      <Styled.ErrorLabel>
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
      </Styled.ErrorLabel>
    )
  }, [sourceChainFeeError, swapFees, intl, sourceAssetProp.chain, sourceChainAssetAmount])

  // Label: Swap result <= 1e8
  const swapResultLabel = useMemo(
    () => formatAssetAmount({ amount: baseToAsset(swapResultAmountMax1e8), trimZeros: true }),
    [swapResultAmountMax1e8]
  )

  // Label: Min amount to swap (<= 1e8)
  const swapMinResultLabel = useMemo(() => {
    // for label we do need to convert decimal back to original decimal
    const amount: BaseAmount = FP.pipe(
      swapLimit1e8,
      O.fold(
        () => baseAmount(0, targetAssetDecimal) /* assetAmount1e8 */,
        (limit1e8) => convertBaseAmountDecimal(limit1e8, targetAssetDecimal)
      )
    )

    const amountMax1e8 = max1e8BaseAmount(amount)

    return disableSlippage
      ? '--'
      : `${formatAssetAmountCurrency({
          asset: targetAssetProp,
          amount: baseToAsset(amountMax1e8),
          trimZeros: true
        })}`
  }, [disableSlippage, swapLimit1e8, targetAssetDecimal, targetAssetProp])

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

  const renderApproveFeeError: JSX.Element = useMemo(() => {
    if (
      !isApproveFeeError ||
      // Don't render error if walletBalances are still loading
      walletBalancesLoading
    )
      return <></>

    return (
      <Styled.ErrorLabel>
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
      </Styled.ErrorLabel>
    )
  }, [isApproveFeeError, walletBalancesLoading, intl, sourceAssetProp.chain, sourceChainAssetAmount, approveFee])

  const onApprove = useCallback(() => {
    if (useSourceAssetLedger) {
      setShowLedgerModal('approve')
    } else {
      setShowPasswordModal('approve')
    }
  }, [setShowLedgerModal, useSourceAssetLedger])

  const renderApproveError = useMemo(
    () =>
      FP.pipe(
        approveState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => <Styled.ErrorLabel>{error.msg}</Styled.ErrorLabel>,
          () => <></>
        )
      ),
    [approveState]
  )

  const isApproved = useMemo(
    () =>
      !needApprovement ||
      RD.isSuccess(approveState) ||
      FP.pipe(
        isApprovedState,
        // ignore other RD states and set to `true`
        // to avoid switch between approve and submit button
        // Submit button will still be disabled
        RD.getOrElse(() => true)
      ),
    [approveState, isApprovedState, needApprovement]
  )

  const checkIsApproved = useMemo(() => {
    if (!needApprovement) return false
    // ignore initial + loading states for `isApprovedState`
    return RD.isPending(isApprovedState)
  }, [isApprovedState, needApprovement])

  const checkIsApprovedError = useMemo(() => {
    // ignore error check if we don't need to check allowance
    if (!needApprovement) return false

    return RD.isFailure(isApprovedState)
  }, [needApprovement, isApprovedState])

  const renderIsApprovedError = useMemo(() => {
    if (!checkIsApprovedError) return <></>

    return FP.pipe(
      isApprovedState,

      RD.fold(
        () => <></>,
        () => <></>,
        (error) => (
          <Styled.ErrorLabel align="center">
            {intl.formatMessage({ id: 'common.approve.error' }, { asset: sourceAssetProp.ticker, error: error.msg })}
          </Styled.ErrorLabel>
        ),
        (_) => <></>
      )
    )
  }, [checkIsApprovedError, intl, isApprovedState, sourceAssetProp.ticker])

  const reset = useCallback(() => {
    // reset swap state
    resetSwapState()
    // reset isApproved state
    resetIsApprovedState()
    // reset approve state
    resetApproveState()
    // zero amount to swap
    setAmountToSwapMax1e8(initialAmountToSwapMax1e8)
    // reload fees
    reloadFeesHandler()
  }, [
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

  const disableSwitchAssets = useMemo(() => {
    const hasTargetBalance = FP.pipe(
      oTargetAsset,
      O.chain((asset) => {
        const oWalletBalances = NEA.fromArray(allBalances)
        return getWalletBalanceByAssetAndWalletType({
          oWalletBalances,
          asset,
          walletType: sourceWalletType
        })
      }),
      O.map(({ amount }) => amount.gt(baseAmount(0, targetAssetDecimal))),
      O.getOrElse(() => false)
    )

    return !hasTargetBalance
  }, [allBalances, oTargetAsset, sourceWalletType, targetAssetDecimal])

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
      disableSwapAction ||
      lockedWallet ||
      isZeroAmountToSwap ||
      walletBalancesLoading ||
      sourceChainFeeError ||
      RD.isPending(swapFeesRD) ||
      RD.isPending(approveState) ||
      minAmountError ||
      isCausedSlippage ||
      swapResultAmountMax1e8.lte(zeroTargetBaseAmountMax1e8) ||
      O.isNone(oTargetAddress),
    [
      disableSwapAction,
      lockedWallet,
      isZeroAmountToSwap,
      walletBalancesLoading,
      sourceChainFeeError,
      swapFeesRD,
      approveState,
      minAmountError,
      isCausedSlippage,
      swapResultAmountMax1e8,
      zeroTargetBaseAmountMax1e8,
      oTargetAddress
    ]
  )

  const disableSubmitApprove = useMemo(
    () => checkIsApprovedError || isApproveFeeError || walletBalancesLoading || O.isNone(oApproveParams),

    [checkIsApprovedError, isApproveFeeError, oApproveParams, walletBalancesLoading]
  )

  const onChangeTargetAddress = useCallback(
    (address: Address) => {
      setTargetWalletAddress(O.some(address))

      // update state of `useTargetAssetLedger`
      const isTargetLedgerAddress = FP.pipe(
        oTargetLedgerAddress,
        O.map((ledgerAddress) => eqAddress.equals(ledgerAddress, address)),
        O.getOrElse(() => false)
      )
      setUseTargetAssetLedger(isTargetLedgerAddress)
    },
    [oTargetLedgerAddress]
  )

  const renderCustomAddressInput = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oTargetAsset, oTargetWalletAddress),
        O.fold(
          () => <></>,
          ([asset, address]) => (
            <EditableAddress
              key={address}
              asset={asset}
              network={network}
              address={address}
              onClickOpenAddress={(address) => clickAddressLinkHandler(address)}
              onChangeAddress={onChangeTargetAddress}
              onChangeEditableAddress={(newAddress) => setEditableTargetWalletAddress(O.some(newAddress))}
              onChangeEditableMode={(editModeActive) => setCustomAddressEditActive(editModeActive)}
              addressValidator={addressValidator}
            />
          )
        )
      ),
    [oTargetAsset, oTargetWalletAddress, network, onChangeTargetAddress, addressValidator, clickAddressLinkHandler]
  )

  const renderTargetWalletType = useMemo(() => {
    return FP.pipe(
      oTargetWalletType,
      O.fold(
        () => <></>,
        (walletType) => <WalletTypeLabel>{walletType}</WalletTypeLabel>
      )
    )
  }, [oTargetWalletType])

  const onClickUseSourceAssetLedger = useCallback(() => {
    const useLedger = !useSourceAssetLedger
    setUseSourceAssetLedger(() => !useSourceAssetLedger)
    const oAddress = useLedger ? oSourceLedgerAddress : oInitialSourceWalletAddress
    setSourceWalletAddress(oAddress)
  }, [oInitialSourceWalletAddress, oSourceLedgerAddress, useSourceAssetLedger])

  const onClickUseTargetAssetLedger = useCallback(() => {
    const useLedger = !useTargetAssetLedger
    setUseTargetAssetLedger(useLedger)
    const oAddress = useLedger ? oTargetLedgerAddress : oInitialTargetWalletAddress
    setTargetWalletAddress(oAddress)
    setEditableTargetWalletAddress(oAddress)
  }, [oInitialTargetWalletAddress, oTargetLedgerAddress, useTargetAssetLedger])

  const renderMemo = useMemo(
    () => (
      <div className="flex items-center justify-center pt-20px">
        {FP.pipe(
          oSwapParams,
          O.fold(
            () => (
              <div className="text-12px cursor-not-allowed text-center uppercase text-gray1 dark:text-gray1d">
                {intl.formatMessage({ id: 'common.memo' })}
              </div>
            ),
            ({ memo }) => (
              <CopyLabel
                className="text-12px uppercase text-gray1 hover:text-gray2 dark:text-gray1d dark:hover:text-gray2d"
                label={intl.formatMessage({ id: 'common.memo' })}
                textToCopy={memo}
              />
            )
          )
        )}
      </div>
    ),
    [intl, oSwapParams]
  )
  return (
    // Note: Just one Tab to use as same styles as for other views (deposit / wallet)
    <Styled.Tabs
      centered
      tabs={[
        {
          label: intl.formatMessage({ id: 'common.swap' }),
          key: 'default',
          // Content includes everything of Swap content
          content: (
            <Styled.Container>
              <Styled.ContentContainer>
                <Styled.FormContainer>
                  <Styled.CurrencyInfoContainer>
                    <CurrencyInfo
                      slip={swapData.slip}
                      slipTolerance={slipTolerance}
                      isCausedSlippage={isCausedSlippage}
                      changeSlipTolerance={changeSlipTolerance}
                      from={oSourcePoolAsset}
                      to={oTargetPoolAsset}
                      disableSlippage={disableSlippage}
                      disableSlippageMsg={intl.formatMessage({ id: 'swap.slip.tolerance.ledger-disabled.info' })}
                    />
                  </Styled.CurrencyInfoContainer>

                  <Styled.ValueItemContainer className={'valueItemContainer-source'}>
                    <Styled.ValueItemSourceWrapper>
                      {/* Note: Input value is shown as AssetAmount */}
                      <Styled.AssetInput
                        title={intl.formatMessage({ id: 'swap.input' })}
                        titleTooltip={FP.pipe(
                          oSourceWalletAddress,
                          O.getOrElse(() => '')
                        )}
                        onChange={setAmountToSwapMax1e8}
                        onBlur={reloadFeesHandler}
                        amount={amountToSwapMax1e8}
                        maxAmount={maxAmountToSwapMax1e8}
                        hasError={minAmountError}
                        asset={sourceAssetProp}
                        disabled={lockedWallet}
                        maxInfoText={intl.formatMessage({ id: 'swap.info.max.fee' })}
                      />
                      {renderMinAmount}
                    </Styled.ValueItemSourceWrapper>
                    {FP.pipe(
                      oSourceAsset,
                      O.fold(
                        () => <></>,
                        (asset) => (
                          <Styled.AssetSelectContainer>
                            <AssetSelect
                              onSelect={setSourceAsset}
                              asset={asset}
                              assets={selectableSourceAssets}
                              dialogHeadline={intl.formatMessage({ id: 'common.asset.change' })}
                              network={network}
                            />

                            <Styled.CheckButton
                              checked={useSourceAssetLedger}
                              clickHandler={onClickUseSourceAssetLedger}
                              disabled={!hasSourceAssetLedger}>
                              {intl.formatMessage({ id: 'ledger.title' })}
                            </Styled.CheckButton>
                          </Styled.AssetSelectContainer>
                        )
                      )
                    )}
                  </Styled.ValueItemContainer>

                  <Styled.ValueItemContainer className="valueItemContainer-percent">
                    <Styled.SliderContainer>{renderSlider}</Styled.SliderContainer>
                    <Styled.SwapOutlinedContainer>
                      <Styled.SwapOutlined
                        disabled={disableSwitchAssets}
                        onClick={!disableSwitchAssets ? () => onSwitchAssets() : undefined}
                      />
                    </Styled.SwapOutlinedContainer>
                  </Styled.ValueItemContainer>
                  <Styled.ValueItemContainer className="valueItemContainer-target">
                    <Styled.ValueItemWrapper>
                      <Styled.InValueContainer>
                        <Styled.ValueTitle>{intl.formatMessage({ id: 'swap.output' })}</Styled.ValueTitle>
                        <Styled.InValueLabel>{swapResultLabel}</Styled.InValueLabel>
                      </Styled.InValueContainer>
                      <Styled.InMinValueContainer>
                        <Styled.InMinValueLabel>
                          {intl.formatMessage({ id: 'common.min' })}: {swapMinResultLabel}
                        </Styled.InMinValueLabel>
                        <InfoIcon
                          color={disableSlippage ? 'warning' : 'primary'}
                          tooltip={
                            disableSlippage
                              ? intl.formatMessage({ id: 'swap.slip.tolerance.ledger-disabled.info' })
                              : intl.formatMessage({ id: 'swap.min.result.info' }, { tolerance: slipTolerance })
                          }
                        />
                      </Styled.InMinValueContainer>
                    </Styled.ValueItemWrapper>
                    {FP.pipe(
                      oTargetAsset,
                      O.fold(
                        () => <></>,
                        (asset) => (
                          <Styled.AssetSelectContainer>
                            <AssetSelect
                              onSelect={setTargetAsset}
                              asset={asset}
                              assets={selectableTargetAssets}
                              dialogHeadline={intl.formatMessage({ id: 'common.asset.change' })}
                              network={network}
                            />
                            <Styled.CheckButton
                              checked={useTargetAssetLedger}
                              clickHandler={onClickUseTargetAssetLedger}
                              disabled={!hasTargetAssetLedger}>
                              {intl.formatMessage({ id: 'ledger.title' })}
                            </Styled.CheckButton>
                          </Styled.AssetSelectContainer>
                        )
                      )
                    )}
                  </Styled.ValueItemContainer>
                  {!lockedWallet && (
                    <Styled.TargetAddressContainer>
                      <Row>
                        <Styled.ValueTitle>{intl.formatMessage({ id: 'common.recipient' })}</Styled.ValueTitle>
                        {renderTargetWalletType}
                      </Row>
                      {renderCustomAddressInput}
                    </Styled.TargetAddressContainer>
                  )}
                </Styled.FormContainer>
              </Styled.ContentContainer>

              {(walletBalancesLoading || checkIsApproved) && (
                <LoadingView
                  label={
                    // We show only one loading state at time
                    // Order matters: Show states with shortest loading time before others
                    // (approve state takes just a short time to load, but needs to be displayed)
                    checkIsApproved
                      ? intl.formatMessage({ id: 'common.approve.checking' }, { asset: sourceAssetProp.ticker })
                      : walletBalancesLoading
                      ? intl.formatMessage({ id: 'common.balance.loading' })
                      : undefined
                  }
                />
              )}
              {renderIsApprovedError}
              <Styled.SubmitContainer>
                {!isLocked(keystore) ? (
                  isApproved ? (
                    <>
                      <FlatButton
                        className="my-30px min-w-[200px]"
                        size="large"
                        color="primary"
                        onClick={onSubmit}
                        disabled={disableSubmit}>
                        {intl.formatMessage({ id: 'common.swap' })}
                      </FlatButton>
                      {!RD.isInitial(uiFees) && <Fees fees={uiFees} reloadFees={reloadFeesHandler} />}
                      {sourceChainFeeErrorLabel}
                    </>
                  ) : (
                    <>
                      {renderApproveFeeError}
                      {renderApproveError}
                      <FlatButton
                        className="my-30px min-w-[200px]"
                        size="large"
                        color="warning"
                        disabled={disableSubmitApprove}
                        onClick={onApprove}
                        loading={RD.isPending(approveState)}>
                        {intl.formatMessage({ id: 'common.approve' })}
                      </FlatButton>

                      {!RD.isInitial(uiApproveFeesRD) && (
                        <Fees fees={uiApproveFeesRD} reloadFees={reloadApproveFeesHandler} />
                      )}
                    </>
                  )
                ) : (
                  <>
                    <Styled.NoteLabel>
                      {!hasImportedKeystore(keystore)
                        ? intl.formatMessage({ id: 'swap.note.nowallet' })
                        : isLocked(keystore) && intl.formatMessage({ id: 'swap.note.lockedWallet' })}
                    </Styled.NoteLabel>
                    <FlatButton className="my-30px min-w-[200px]" size="large" onClick={importWalletHandler}>
                      {!hasImportedKeystore(keystore)
                        ? intl.formatMessage({ id: 'wallet.add.label' })
                        : isLocked(keystore) && intl.formatMessage({ id: 'wallet.unlock.label' })}
                    </FlatButton>
                  </>
                )}
              </Styled.SubmitContainer>
              {renderMemo}
              {renderPasswordConfirmationModal}
              {renderLedgerConfirmationModal}
              {renderTxModal}
            </Styled.Container>
          )
        }
      ]}
    />
  )
}
