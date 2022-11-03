import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline'
import { getSwapMemo, getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import {
  Asset,
  assetToString,
  baseToAsset,
  BaseAmount,
  baseAmount,
  formatAssetAmountCurrency,
  delay,
  Chain,
  assetToBase,
  assetAmount,
  chainToString,
  Address
} from '@xchainjs/xchain-util'
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
  to1e8BaseAmount,
  THORCHAIN_DECIMAL,
  isUSDAsset
} from '../../helpers/assetHelper'
import { getChainAsset, isBchChain, isBtcChain, isDogeChain, isEthChain, isLtcChain } from '../../helpers/chainHelper'
import { unionAssets } from '../../helpers/fp/array'
import { eqAsset, eqBaseAmount, eqOAsset, eqOApproveParams, eqAddress, eqOAddress } from '../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption } from '../../helpers/fpHelpers'
import * as PoolHelpers from '../../helpers/poolHelper'
import { liveData, LiveData } from '../../helpers/rx/liveData'
import { emptyString, loadingString, noDataString } from '../../helpers/stringHelper'
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
import { PoolAddress, PoolDetails, PoolsDataMap } from '../../services/midgard/types'
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
import { AssetWithAmount, SlipTolerance } from '../../types/asgardex'
import { PricePool } from '../../views/pools/Pools.types'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../modal/confirmation'
import { TxModal } from '../modal/tx'
import { SwapAssets } from '../modal/tx/extra'
import { LoadingView } from '../shared/loading'
import { AssetInput } from '../uielements/assets/assetInput'
import { ASSET_SELECT_BUTTON_WIDTH } from '../uielements/assets/assetInput/AssetInput'
import { BaseButton, FlatButton, ViewTxButton } from '../uielements/button'
import { CheckButton } from '../uielements/button/CheckButton'
import { MaxBalanceButton } from '../uielements/button/MaxBalanceButton'
import { Tooltip, TooltipAddress, WalletTypeLabel } from '../uielements/common/Common.styles'
import { Fees, UIFeesRD } from '../uielements/fees'
import { InfoIcon } from '../uielements/info'
import { CopyLabel } from '../uielements/label'
import { EditableAddress } from './EditableAddress'
import { SelectableSlipTolerance } from './SelectableSlipTolerance'
import { SwapAsset, SwapData } from './Swap.types'
import * as Utils from './Swap.utils'

const ErrorLabel: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }): JSX.Element => (
  <div className={`mb-[14px] text-center font-main uppercase text-error0 dark:text-error0d ${className} text-[12px]`}>
    {children}
  </div>
)

export type SwapProps = {
  keystore: KeystoreState
  poolAssets: Asset[]
  assets: {
    source: SwapAsset
    target: SwapAsset
  }
  poolAddress: O.Option<PoolAddress>
  swap$: SwapStateHandler
  poolsData: PoolsDataMap
  pricePool: PricePool
  poolDetails: PoolDetails
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
  poolAssets,
  assets: {
    source: { asset: sourceAsset, decimal: sourceAssetDecimal, price: sourceAssetPrice },
    target: { asset: targetAsset, decimal: targetAssetDecimal, price: targetAssetPrice }
  },
  poolAddress: oPoolAddress,
  swap$,
  poolsData,
  poolDetails,
  pricePool,
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

  const lockedWallet: boolean = useMemo(() => isLocked(keystore) || !hasImportedKeystore(keystore), [keystore])

  const [oTargetWalletAddress, setTargetWalletAddress] = useState<O.Option<Address>>(oInitialTargetWalletAddress)
  const [editableTargetWalletAddress, setEditableTargetWalletAddress] =
    useState<O.Option<Address>>(oInitialTargetWalletAddress)

  // Update state needed - initial target walletAddress is loaded async and can be different at first run
  useEffect(() => {
    setTargetWalletAddress(oInitialTargetWalletAddress)
    setEditableTargetWalletAddress(oInitialTargetWalletAddress)
  }, [oInitialTargetWalletAddress])

  const { balances: oWalletBalances, loading: walletBalancesLoading } = walletBalances

  // ZERO `BaseAmount` for target Asset - original decimal
  const zeroTargetBaseAmountMax = useMemo(() => baseAmount(0, targetAssetDecimal), [targetAssetDecimal])

  // ZERO `BaseAmount` for target Asset <= 1e8
  const zeroTargetBaseAmountMax1e8 = useMemo(() => max1e8BaseAmount(zeroTargetBaseAmountMax), [zeroTargetBaseAmountMax])

  const prevSourceAsset = useRef<O.Option<Asset>>(O.none)
  const prevTargetAsset = useRef<O.Option<Asset>>(O.none)

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

  const disableSwapAction = useMemo(() => {
    const sourceChain = sourceAsset.chain
    const targetChain = targetAsset.chain
    return (
      disableAllPoolActions(sourceChain) ||
      disableTradingPoolActions(sourceChain) ||
      disableAllPoolActions(targetChain) ||
      disableTradingPoolActions(targetChain) ||
      customAddressEditActive
    )
  }, [customAddressEditActive, disableAllPoolActions, disableTradingPoolActions, sourceAsset.chain, targetAsset.chain])

  /**
   * All balances based on available assets to swap
   */
  const allBalances: WalletBalances = useMemo(
    () =>
      FP.pipe(
        oWalletBalances,
        // filter wallet balances to include assets available to swap only
        O.map((balances) => filterWalletBalancesByAssets(balances, poolAssets)),
        O.getOrElse<WalletBalances>(() => [])
      ),
    [poolAssets, oWalletBalances]
  )

  const hasSourceAssetLedger = useMemo(
    () => hasLedgerInBalancesByAsset(sourceAsset, allBalances),
    [sourceAsset, allBalances]
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
  const oSourceAssetWB: O.Option<WalletBalance> = useMemo(() => {
    const oWalletBalances = NEA.fromArray(allBalances)
    return getWalletBalanceByAssetAndWalletType({
      oWalletBalances,
      asset: sourceAsset,
      walletType: sourceWalletType
    })
  }, [sourceAsset, allBalances, sourceWalletType])

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
  const sourceChainAsset: Asset = useMemo(() => getChainAsset(sourceAsset.chain), [sourceAsset])

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

  const priceAmountToSwapMax1e8: AssetWithAmount = useMemo(
    () =>
      FP.pipe(
        PoolHelpers.getPoolPriceValue({
          balance: { asset: sourceAsset, amount: amountToSwapMax1e8 },
          poolDetails,
          pricePool,
          network
        }),
        O.getOrElse(() => baseAmount(0, amountToSwapMax1e8.decimal)),
        (amount) => ({ asset: pricePool.asset, amount })
      ),
    [amountToSwapMax1e8, network, poolDetails, pricePool, sourceAsset]
  )

  const isZeroAmountToSwap = useMemo(() => amountToSwapMax1e8.amount().isZero(), [amountToSwapMax1e8])

  const zeroSwapFees = useMemo(
    () => getZeroSwapFees({ inAsset: sourceAsset, outAsset: targetAsset }),
    [sourceAsset, targetAsset]
  )

  const prevChainFees = useRef<O.Option<SwapFees>>(O.none)

  const [swapFeesRD] = useObservableState<SwapFeesRD>(() => {
    return FP.pipe(
      fees$({
        inAsset: sourceAsset,
        outAsset: targetAsset
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

  // Price of swap IN fee
  const oPriceSwapInFee: O.Option<AssetWithAmount> = useMemo(() => {
    const asset = swapFees.inFee.asset
    const amount = swapFees.inFee.amount

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ amount, asset: pricePool.asset }))
    )
  }, [network, poolDetails, pricePool, swapFees])

  const priceSwapInFeeLabel = useMemo(
    () =>
      FP.pipe(
        swapFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ inFee: { amount, asset: feeAsset } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(amount),
              asset: feeAsset,
              decimal: isUSDAsset(feeAsset) ? 2 : 6,
              trimZeros: !isUSDAsset(feeAsset)
            })
            const price = FP.pipe(
              oPriceSwapInFee,
              O.map(({ amount, asset: priceAsset }) =>
                eqAsset.equals(feeAsset, priceAsset)
                  ? emptyString
                  : formatAssetAmountCurrency({
                      amount: baseToAsset(amount),
                      asset: priceAsset,
                      decimal: isUSDAsset(priceAsset) ? 2 : 6,
                      trimZeros: !isUSDAsset(priceAsset)
                    })
              ),
              O.getOrElse(() => emptyString)
            )

            return price ? `${price} (${fee})` : fee
          }
        )
      ),

    [oPriceSwapInFee, swapFeesRD]
  )

  // Price of swap OUT fee
  const oPriceSwapOutFee: O.Option<AssetWithAmount> = useMemo(() => {
    const asset = swapFees.outFee.asset
    const amount = swapFees.outFee.amount

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ asset: pricePool.asset, amount }))
    )
  }, [network, poolDetails, pricePool, swapFees])

  const priceSwapOutFeeLabel = useMemo(
    () =>
      FP.pipe(
        swapFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ outFee: { amount, asset: feeAsset } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(amount),
              asset: feeAsset,
              decimal: isUSDAsset(feeAsset) ? 2 : 6,
              trimZeros: !isUSDAsset(feeAsset)
            })
            const price = FP.pipe(
              oPriceSwapOutFee,
              O.map(({ amount, asset: priceAsset }) =>
                eqAsset.equals(feeAsset, priceAsset)
                  ? emptyString
                  : formatAssetAmountCurrency({
                      amount: baseToAsset(amount),
                      asset: priceAsset,
                      decimal: isUSDAsset(priceAsset) ? 2 : 6,
                      trimZeros: !isUSDAsset(priceAsset)
                    })
              ),
              O.getOrElse(() => emptyString)
            )

            return price ? `${price} (${fee})` : fee
          }
        )
      ),

    [oPriceSwapOutFee, swapFeesRD]
  )

  /**
   * Price sum of swap fees (IN + OUT)
   */
  const oPriceSwapFees1e8: O.Option<AssetWithAmount> = useMemo(
    () =>
      FP.pipe(
        sequenceSOption({ inFee: oPriceSwapInFee, outFee: oPriceSwapOutFee }),
        O.map(({ inFee, outFee }) => {
          const in1e8 = to1e8BaseAmount(inFee.amount)
          const out1e8 = to1e8BaseAmount(outFee.amount)
          return { asset: inFee.asset, amount: in1e8.plus(out1e8) }
        })
      ),
    [oPriceSwapInFee, oPriceSwapOutFee]
  )

  const priceSwapFeesLabel = useMemo(
    () =>
      FP.pipe(
        swapFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          (_) =>
            FP.pipe(
              oPriceSwapFees1e8,
              O.map(({ amount, asset }) =>
                formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: isUSDAsset(asset) ? 2 : 6 })
              ),
              O.getOrElse(() => noDataString)
            )
        )
      ),
    [oPriceSwapFees1e8, swapFeesRD]
  )

  // Helper to price target fees into source asset - original decimal
  const outFeeInTargetAsset: BaseAmount = useMemo(() => {
    const {
      outFee: { amount: outFeeAmount, asset: outFeeAsset }
    } = swapFees

    // no pricing if target asset === target fee asset
    if (eqAsset.equals(targetAsset, outFeeAsset)) return outFeeAmount

    const oTargetFeeAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(outFeeAsset)])
    const oTargetAssetPoolData: O.Option<PoolData> = O.fromNullable(poolsData[assetToString(targetAsset)])

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
  }, [swapFees, targetAsset, poolsData, zeroTargetBaseAmountMax, targetAssetDecimal])

  const swapData: SwapData = useMemo(
    () =>
      Utils.getSwapData({
        amountToSwap: amountToSwapMax1e8,
        sourceAsset: sourceAsset,
        targetAsset: targetAsset,
        poolsData
      }),
    [amountToSwapMax1e8, sourceAsset, targetAsset, poolsData]
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

  /**
   * Price of swap result in max 1e8
   */
  const priceSwapResultAmountMax1e8: AssetWithAmount = useMemo(
    () =>
      FP.pipe(
        PoolHelpers.getPoolPriceValue({
          balance: { asset: targetAsset, amount: swapResultAmountMax1e8 },
          poolDetails,
          pricePool,
          network
        }),
        O.getOrElse(() => baseAmount(0, THORCHAIN_DECIMAL /* default decimal*/)),
        (amount) => ({ asset: pricePool.asset, amount })
      ),
    [swapResultAmountMax1e8, network, poolDetails, pricePool, targetAsset]
  )

  // Disable slippage selection temporary for Ledger/BTC (see https://github.com/thorchain/asgardex-electron/issues/2068)
  const disableSlippage = useMemo(() => {
    const chain = sourceAsset.chain
    return (isBtcChain(chain) || isLtcChain(chain) || isBchChain(chain) || isDogeChain(chain)) && useSourceAssetLedger
  }, [useSourceAssetLedger, sourceAsset])

  const swapLimit1e8: O.Option<BaseAmount> = useMemo(() => {
    // Disable slippage protection temporary for Ledger/BTC (see https://github.com/thorchain/asgardex-electron/issues/2068)
    return !disableSlippage && swapResultAmountMax1e8.gt(zeroTargetBaseAmountMax1e8)
      ? O.some(Utils.getSwapLimit1e8(swapResultAmountMax1e8, slipTolerance))
      : O.none
  }, [disableSlippage, slipTolerance, swapResultAmountMax1e8, zeroTargetBaseAmountMax1e8])

  const oSwapParams: O.Option<SwapTxParams> = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oPoolAddress, oTargetAddress, oSourceAssetWB),
        O.map(([poolAddress, address, { walletType, walletAddress, walletIndex, hdMode }]) => {
          const memo = getSwapMemo({
            asset: targetAsset,
            address,
            limit: O.toUndefined(swapLimit1e8) // limit needs to be in 1e8
          })
          return {
            poolAddress,
            asset: sourceAsset,
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
    [
      oPoolAddress,
      oTargetAddress,
      oSourceAssetWB,
      targetAsset,
      swapLimit1e8,
      sourceAsset,
      amountToSwapMax1e8,
      sourceAssetDecimal
    ]
  )

  const isCausedSlippage = useMemo(() => swapData.slip.toNumber() > slipTolerance, [swapData.slip, slipTolerance])

  type RateDirection = 'fromSource' | 'fromTarget'
  const [rateDirection, setRateDirection] = useState<RateDirection>('fromSource')

  const rateLabel = useMemo(() => {
    switch (rateDirection) {
      case 'fromSource':
        return `${formatAssetAmountCurrency({
          asset: sourceAsset,
          amount: assetAmount(1),
          decimal: isUSDAsset(sourceAsset) ? 2 : 6,
          trimZeros: true
        })}${' '}=${' '}${formatAssetAmountCurrency({
          asset: targetAsset,
          amount: assetAmount(sourceAssetPrice.dividedBy(targetAssetPrice)),
          decimal: isUSDAsset(targetAsset) ? 2 : 6,
          trimZeros: true
        })}`
      case 'fromTarget':
        return `${formatAssetAmountCurrency({
          asset: targetAsset,
          decimal: isUSDAsset(targetAsset) ? 2 : 6,
          amount: assetAmount(1),
          trimZeros: true
        })}${' '}=${' '}${formatAssetAmountCurrency({
          asset: sourceAsset,
          decimal: isUSDAsset(sourceAsset) ? 2 : 6,
          amount: assetAmount(targetAssetPrice.dividedBy(sourceAssetPrice)),
          trimZeros: true
        })}`
    }
  }, [rateDirection, sourceAsset, sourceAssetPrice, targetAsset, targetAssetPrice])

  const needApprovement = useMemo(() => {
    // not needed for users with locked or not imported wallets
    if (!hasImportedKeystore(keystore) || isLocked(keystore)) return false
    // Other chains than ETH do not need an approvement
    if (!isEthChain(sourceChainAsset.chain)) return false
    // ETH does not need to be approved
    if (isEthAsset(sourceAsset)) return false
    // ERC20 token does need approvement only
    return isEthTokenAsset(sourceAsset)
  }, [keystore, sourceAsset, sourceChainAsset.chain])

  const oApproveParams: O.Option<ApproveParams> = useMemo(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    const oTokenAddress: O.Option<string> = getEthTokenAddress(sourceAsset)

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
  }, [needApprovement, network, oPoolAddress, oSourceAssetWB, sourceAsset])

  // Reload balances at `onMount`
  useEffect(() => {
    reloadBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reloadFeesHandler = useCallback(() => {
    reloadFees({
      inAsset: sourceAsset,
      outAsset: targetAsset
    })
  }, [reloadFees, sourceAsset, targetAsset])

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

      onChangePath(
        swap.path({
          source: assetToString(asset),
          target: assetToString(targetAsset)
        })
      )
    },
    [onChangePath, targetAsset]
  )

  const setTargetAsset = useCallback(
    async (asset: Asset) => {
      // delay to avoid render issues while switching
      await delay(100)

      onChangePath(
        swap.path({
          source: assetToString(sourceAsset),
          target: assetToString(asset)
        })
      )
    },
    [sourceAsset, onChangePath]
  )

  const minAmountToSwapMax1e8: BaseAmount = useMemo(
    () =>
      Utils.minAmountToSwapMax1e8({
        swapFees,
        inAsset: sourceAsset,
        inAssetDecimal: sourceAssetDecimal,
        outAsset: targetAsset,
        poolsData
      }),
    [poolsData, sourceAssetDecimal, sourceAsset, swapFees, targetAsset]
  )

  const minAmountError = useMemo(() => {
    if (isZeroAmountToSwap) return false

    return amountToSwapMax1e8.lt(minAmountToSwapMax1e8)
  }, [amountToSwapMax1e8, isZeroAmountToSwap, minAmountToSwapMax1e8])

  const renderMinAmount = useMemo(
    () => (
      <div className="flex w-full items-center pl-10px pt-5px">
        <p
          className={`m-0 pr-5px font-main text-[12px] uppercase ${
            minAmountError ? 'dark:error-0d text-error0' : 'text-gray2 dark:text-gray2d'
          }`}>
          {`${intl.formatMessage({ id: 'common.min' })}: ${formatAssetAmountCurrency({
            asset: sourceAsset,
            amount: baseToAsset(minAmountToSwapMax1e8),
            trimZeros: true
          })}`}
        </p>
        <InfoIcon
          // override color
          className={`${minAmountError ? '' : 'text-gray2 dark:text-gray2d'}`}
          color={minAmountError ? 'error' : 'neutral'}
          tooltip={intl.formatMessage({ id: 'swap.min.amount.info' })}
        />
      </div>
    ),
    [intl, minAmountError, minAmountToSwapMax1e8, sourceAsset]
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
        allBalances,
        // get asset
        A.map(({ asset }) => asset),
        // Remove target assets from source list
        A.filter((asset) => !eqAsset.equals(asset, targetAsset)),
        // Merge duplications
        (assets) => unionAssets(assets)(assets)
      ),

    [allBalances, targetAsset]
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
        poolAssets,
        // Remove source assets from List
        A.filter((asset) => !eqAsset.equals(asset, sourceAsset)),
        // Merge duplications
        (assets) => unionAssets(assets)(assets)
      ),
    [poolAssets, sourceAsset]
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

  const extraTxModalContent = useMemo(() => {
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
          `${intl.formatMessage({ id: 'common.step' }, { current: swapState.step, total: swapState.stepsTotal })}: ${
            stepLabels[swapState.step - 1]
          }`,
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
  }, [
    intl,
    swapState.swap,
    swapState.step,
    swapState.stepsTotal,
    sourceAsset,
    amountToSwapMax1e8,
    targetAsset,
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
      RD.toOption(swapTx),
      // Note: As long as we link to `viewblock` to open tx details in a browser,
      // `0x` needs to be removed from tx hash in case of ETH
      // @see https://github.com/thorchain/asgardex-electron/issues/1787#issuecomment-931934508
      O.map((txHash) => (isEthChain(sourceAsset.chain) ? txHash.replace(/0x/i, '') : txHash))
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
    sourceAsset,
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

    const onClose = () => {
      setShowLedgerModal('none')
    }

    const onSucceess = () => {
      if (showLedgerModal === 'swap') submitSwapTx()
      if (showLedgerModal === 'approve') submitApproveTx()
      setShowLedgerModal('none')
    }

    const chainAsString = chainToString(sourceAsset.chain)
    const txtNeedsConnected = intl.formatMessage(
      {
        id: 'ledger.needsconnected'
      },
      { chain: chainAsString }
    )

    const description1 =
      // extra info for ERC20 assets only
      isEthChain(sourceAsset.chain) && !isEthAsset(sourceAsset)
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
        chain={sourceAsset.chain}
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
  }, [intl, network, sourceAsset, oSwapParams, showLedgerModal, submitApproveTx, submitSwapTx, useSourceAssetLedger])

  const sourceChainFeeError: boolean = useMemo(() => {
    // ignore error check by having zero amounts or min amount errors
    if (isZeroAmountToSwap || minAmountError) return false

    const {
      inFee: { amount: inFeeAmount }
    } = swapFees

    return inFeeAmount.gt(sourceChainAssetAmount)
  }, [isZeroAmountToSwap, minAmountError, swapFees, sourceChainAssetAmount])

  const sourceChainFeeErrorLabel: JSX.Element = useMemo(() => {
    if (!sourceChainFeeError) {
      return <></>
    }

    const {
      inFee: { asset: inFeeAsset, amount: inFeeAmount }
    } = swapFees

    return (
      <ErrorLabel>
        {intl.formatMessage(
          { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
          {
            balance: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAsset.chain),
              amount: baseToAsset(sourceChainAssetAmount),
              trimZeros: true
            }),
            fee: formatAssetAmountCurrency({
              asset: inFeeAsset,
              trimZeros: true,
              amount: baseToAsset(inFeeAmount)
            })
          }
        )}
      </ErrorLabel>
    )
  }, [sourceChainFeeError, swapFees, intl, sourceAsset.chain, sourceChainAssetAmount])

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
      ? noDataString
      : `${formatAssetAmountCurrency({
          asset: targetAsset,
          amount: baseToAsset(amountMax1e8),
          trimZeros: true
        })}`
  }, [disableSlippage, swapLimit1e8, targetAssetDecimal, targetAsset])

  const uiApproveFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        approveFeeRD,
        RD.map((approveFee) => [{ asset: getChainAsset(sourceAsset.chain), amount: approveFee }])
      ),
    [approveFeeRD, sourceAsset.chain]
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
    ) {
      return <></>
    }

    return (
      <ErrorLabel>
        {intl.formatMessage(
          { id: 'swap.errors.amount.balanceShouldCoverChainFee' },
          {
            balance: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAsset.chain),
              amount: baseToAsset(sourceChainAssetAmount),
              trimZeros: true
            }),
            fee: formatAssetAmountCurrency({
              asset: getChainAsset(sourceAsset.chain),
              trimZeros: true,
              amount: baseToAsset(approveFee)
            })
          }
        )}
      </ErrorLabel>
    )
  }, [isApproveFeeError, walletBalancesLoading, intl, sourceAsset.chain, sourceChainAssetAmount, approveFee])

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
          (error) => <ErrorLabel>{error.msg}</ErrorLabel>,
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
          <ErrorLabel>
            {intl.formatMessage({ id: 'common.approve.error' }, { asset: sourceAsset.ticker, error: error.msg })}
          </ErrorLabel>
        ),
        (_) => <></>
      )
    )
  }, [checkIsApprovedError, intl, isApprovedState, sourceAsset.ticker])

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
    if (!eqOAsset.equals(prevSourceAsset.current, O.some(sourceAsset))) {
      prevSourceAsset.current = O.some(sourceAsset)
      doReset = true
    }
    // reset data whenever target asset has been changed
    if (!eqOAsset.equals(prevTargetAsset.current, O.some(targetAsset))) {
      prevTargetAsset.current = O.some(targetAsset)
      doReset = true
    }
    // reset only once
    if (doReset) reset()

    // Note: useEffect does depend on `sourceAssetProp`, `targetAssetProp` - ignore other values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceAsset, targetAsset])

  /**
   * Disables switch of assets based on following rule:
   * Target asset (which will be the new source asset after a switch ) needs to have balances.
   * Without balances, a source asset can't doing a swap.
   */
  const disableSwitchAssets = useMemo(() => {
    const hasTargetBalance = FP.pipe(
      allBalances,
      NEA.fromArray,
      (oWalletBalances) =>
        FP.pipe(
          oTargetWalletType,
          O.chain((walletType) =>
            getWalletBalanceByAssetAndWalletType({
              oWalletBalances,
              asset: targetAsset,
              walletType
            })
          )
        ),
      O.map(({ amount }) => amount.gt(baseAmount(0, targetAssetDecimal))),
      O.getOrElse(() => false)
    )

    return !hasTargetBalance
  }, [allBalances, targetAsset, oTargetWalletType, targetAssetDecimal])

  const onSwitchAssets = useCallback(async () => {
    // delay to avoid render issues while switching
    await delay(100)

    onChangePath(
      swap.path({
        target: assetToString(sourceAsset),
        source: assetToString(targetAsset)
      })
    )
  }, [onChangePath, sourceAsset, targetAsset])

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

  const onClickUseSourceAssetLedger = useCallback(() => {
    setUseSourceAssetLedger(() => !useSourceAssetLedger)
  }, [useSourceAssetLedger])

  const onClickUseTargetAssetLedger = useCallback(() => {
    const useLedger = !useTargetAssetLedger
    setUseTargetAssetLedger(useLedger)
    const oAddress = useLedger ? oTargetLedgerAddress : oInitialTargetWalletAddress
    setTargetWalletAddress(oAddress)
    setEditableTargetWalletAddress(oAddress)
  }, [oInitialTargetWalletAddress, oTargetLedgerAddress, useTargetAssetLedger])

  const memoTitle = useMemo(
    () =>
      FP.pipe(
        oSwapParams,
        O.map(({ memo }) => (
          <CopyLabel
            className="pl-0 !font-mainBold text-[14px] uppercase text-gray2 dark:text-gray2d"
            label={intl.formatMessage({ id: 'common.memo' })}
            key="memo-copy"
            textToCopy={memo}
          />
        )),
        O.toNullable
      ),
    [intl, oSwapParams]
  )

  const memoLabel = useMemo(
    () =>
      FP.pipe(
        oSwapParams,
        O.map(({ memo }) => (
          <Tooltip title={memo} key="tooltip-memo">
            {memo}
          </Tooltip>
        )),
        O.toNullable
      ),
    [oSwapParams]
  )

  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <div className="flex w-full max-w-[500px] flex-col justify-between py-[60px]">
      <div>
        <div className="flex flex-col">
          {/* Note: Input value is shown as AssetAmount */}

          <AssetInput
            className="w-full"
            title={intl.formatMessage({ id: 'swap.input' })}
            amount={{ amount: amountToSwapMax1e8, asset: sourceAsset }}
            priceAmount={priceAmountToSwapMax1e8}
            assets={selectableSourceAssets}
            network={network}
            onChangeAsset={setSourceAsset}
            onChange={setAmountToSwapMax1e8}
            onBlur={reloadFeesHandler}
            showError={minAmountError}
          />

          <div className="flex flex-row">
            <div className="flex w-full flex-col">
              <MaxBalanceButton
                className="ml-10px mt-5px"
                classNameButton="!text-gray2 dark:!text-gray2d"
                classNameIcon="text-gray2 dark:text-gray2d"
                size="medium"
                balance={{ amount: maxAmountToSwapMax1e8, asset: sourceAsset }}
                onClick={() => setAmountToSwapMax1e8(maxAmountToSwapMax1e8)}
                maxInfoText={intl.formatMessage({ id: 'swap.info.max.fee' })}
              />
              {minAmountError && renderMinAmount}
            </div>
            {/* Note: 'items-start' needed to avoid stretch button in height of parent container */}
            <div className="flex w-full items-start justify-end">
              <CheckButton
                size="medium"
                color="neutral"
                className={`${ASSET_SELECT_BUTTON_WIDTH} rounded-b-lg bg-gray0 py-5px dark:bg-gray0d ${
                  !hasSourceAssetLedger ? 'hidden' : ''
                }`}
                checked={useSourceAssetLedger}
                clickHandler={onClickUseSourceAssetLedger}>
                {intl.formatMessage({ id: 'ledger.title' })}
              </CheckButton>
            </div>
          </div>
        </div>

        <div className="mb-20px flex w-full justify-center">
          <BaseButton
            disabled={disableSwitchAssets}
            onClick={!disableSwitchAssets ? () => onSwitchAssets() : undefined}
            className="group w-full">
            <ArrowsUpDownIcon
              className={`ease h-[30px] w-[30px] text-turquoise
                   ${!disableSwitchAssets ? 'group-hover:rotate-180' : ''}
                      `}
            />
          </BaseButton>
        </div>
        <div className="flex flex-col">
          <AssetInput
            className="w-full md:w-auto"
            title={intl.formatMessage({ id: 'swap.output' })}
            // Show swap result <= 1e8
            amount={{ amount: swapResultAmountMax1e8, asset: targetAsset }}
            priceAmount={priceSwapResultAmountMax1e8}
            onChangeAsset={setTargetAsset}
            assets={selectableTargetAssets}
            network={network}
            asLabel
          />
          {/* Note: 'items-start' needed to avoid stretch button in height of parent container */}
          <div className="flex w-full items-start justify-end">
            <CheckButton
              size="medium"
              color="neutral"
              className={`${ASSET_SELECT_BUTTON_WIDTH} rounded-b-lg bg-gray0 py-5px dark:bg-gray0d ${
                !hasTargetAssetLedger ? 'hidden' : ''
              }`}
              checked={useTargetAssetLedger}
              clickHandler={onClickUseTargetAssetLedger}>
              {intl.formatMessage({ id: 'ledger.title' })}
            </CheckButton>
          </div>
        </div>
        {!lockedWallet &&
          FP.pipe(
            oTargetAddress,
            O.map((address) => (
              <div className="mt-20px flex flex-col  px-10px" key="edit-address">
                <div className="flex items-center">
                  <h3 className="font-[12px] !mb-0 mr-10px w-auto p-0 font-main uppercase text-text2 dark:text-text2d">
                    {intl.formatMessage({ id: 'common.recipient' })}
                  </h3>
                  {FP.pipe(
                    oTargetWalletType,
                    O.map((walletType) => <WalletTypeLabel key="target-w-type">{walletType}</WalletTypeLabel>),
                    O.toNullable
                  )}
                </div>
                <EditableAddress
                  key={address}
                  asset={targetAsset}
                  network={network}
                  address={address}
                  onClickOpenAddress={(address) => clickAddressLinkHandler(address)}
                  onChangeAddress={onChangeTargetAddress}
                  onChangeEditableAddress={(newAddress) => setEditableTargetWalletAddress(O.some(newAddress))}
                  onChangeEditableMode={(editModeActive) => setCustomAddressEditActive(editModeActive)}
                  addressValidator={addressValidator}
                />
              </div>
            )),
            O.toNullable
          )}
      </div>

      {(walletBalancesLoading || checkIsApproved) && (
        <LoadingView
          className="w-full pt-10px"
          label={
            // We show only one loading state at time
            // Order matters: Show states with shortest loading time before others
            // (approve state takes just a short time to load, but needs to be displayed)
            checkIsApproved
              ? intl.formatMessage({ id: 'common.approve.checking' }, { asset: sourceAsset.ticker })
              : walletBalancesLoading
              ? intl.formatMessage({ id: 'common.balance.loading' })
              : undefined
          }
        />
      )}
      <div className="flex flex-col items-center justify-center">
        {!isLocked(keystore) ? (
          <>
            {isApproved ? (
              <>
                <FlatButton
                  className="my-30px min-w-[200px]"
                  size="large"
                  color="primary"
                  onClick={onSubmit}
                  disabled={disableSubmit}>
                  {intl.formatMessage({ id: 'common.swap' })}
                </FlatButton>
                {sourceChainFeeErrorLabel}
              </>
            ) : (
              <>
                <FlatButton
                  className="my-30px min-w-[200px]"
                  size="large"
                  color="warning"
                  disabled={disableSubmitApprove}
                  onClick={onApprove}
                  loading={RD.isPending(approveState)}>
                  {intl.formatMessage({ id: 'common.approve' })}
                </FlatButton>

                {renderApproveFeeError}
                {renderApproveError}
                {renderIsApprovedError}

                {/* TODO(@veado) ADD ApproveFees to details */}

                {!RD.isInitial(uiApproveFeesRD) && (
                  <Fees fees={uiApproveFeesRD} reloadFees={reloadApproveFeesHandler} />
                )}
              </>
            )}

            <div className={`mx-50px w-full px-10px font-main text-[12px] uppercase dark:border-gray1d`}>
              <BaseButton
                className="goup flex w-full justify-between !p-0 font-mainSemiBold text-[16px] text-text2 hover:text-turquoise dark:text-text2d dark:hover:text-turquoise"
                onClick={() => setShowDetails((current) => !current)}>
                {intl.formatMessage({ id: 'common.details' })}
                {showDetails ? (
                  <MagnifyingGlassMinusIcon className="ease h-[20px] w-[20px] text-inherit group-hover:scale-125" />
                ) : (
                  <MagnifyingGlassPlusIcon className="ease h-[20px] w-[20px] text-inherit group-hover:scale-125 " />
                )}
              </BaseButton>

              <div className="pt-10px font-main text-[14px] text-gray2 dark:text-gray2d">
                {/* Rate */}
                <div className={`flex w-full justify-between font-mainBold text-[14px]`}>
                  <BaseButton
                    className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                    onClick={() =>
                      // toggle rate
                      setRateDirection((current) => (current === 'fromSource' ? 'fromTarget' : 'fromSource'))
                    }>
                    {intl.formatMessage({ id: 'common.rate' })}
                    <ArrowsRightLeftIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
                  </BaseButton>
                  <div>{rateLabel}</div>
                </div>
                {/* fees */}
                <div
                  className={`flex w-full items-center justify-between font-mainBold ${showDetails ? 'pt-10px' : ''}`}>
                  <BaseButton
                    disabled={RD.isPending(swapFeesRD) || RD.isInitial(swapFeesRD)}
                    className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                    onClick={reloadFeesHandler}>
                    {intl.formatMessage({ id: 'common.fees.estimated' })}
                    <ArrowPathIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
                  </BaseButton>
                  <div>{priceSwapFeesLabel}</div>
                </div>

                {showDetails && (
                  <>
                    <div className="flex w-full justify-between pl-10px text-[12px]">
                      <div>{intl.formatMessage({ id: 'common.fee.inbound' })}</div>
                      <div>{priceSwapInFeeLabel}</div>
                    </div>
                    <div className="flex w-full justify-between pl-10px text-[12px]">
                      <div>{intl.formatMessage({ id: 'common.fee.outbound' })}</div>
                      <div>{priceSwapOutFeeLabel}</div>
                    </div>
                    <div className="flex w-full justify-between pl-10px text-[12px]">
                      <div>{intl.formatMessage({ id: 'common.fee.affiliate' })}</div>
                      <div>
                        {formatAssetAmountCurrency({
                          amount: assetAmount(0),
                          asset: pricePool.asset,
                          decimal: 0
                        })}
                      </div>
                    </div>
                  </>
                )}
                {/* Slippage */}
                <div
                  className={`flex w-full justify-between ${showDetails ? 'pt-10px' : ''} font-mainBold text-[14px]${
                    isCausedSlippage ? 'text-error0 dark:text-error0d' : ''
                  }`}>
                  <div>{intl.formatMessage({ id: 'swap.slip.title' })}</div>
                  <div>{swapData.slip.toFixed(2)}%</div>
                </div>

                {showDetails && (
                  <>
                    <div className="flex w-full justify-between pl-10px text-[12px]">
                      <div
                        className={`flex items-center ${disableSlippage ? 'text-warning0 dark:text-warning0d' : ''}`}>
                        {intl.formatMessage({ id: 'swap.slip.tolerance' })}
                        {disableSlippage ? (
                          <InfoIcon
                            className="ml-[3px] h-[15px] w-[15px] text-inherit"
                            tooltip={intl.formatMessage({ id: 'swap.slip.tolerance.ledger-disabled.info' })}
                            color="warning"
                          />
                        ) : (
                          <InfoIcon
                            className="ml-[3px] h-[15px] w-[15px] text-inherit"
                            tooltip={intl.formatMessage({ id: 'swap.slip.tolerance.info' })}
                          />
                        )}
                      </div>
                      <div>
                        {/* we don't show slippage tolerance whenever slippage is disabled (e.g. due memo restriction for Ledger BTC) */}
                        {disableSlippage ? (
                          <>{noDataString}</>
                        ) : (
                          <SelectableSlipTolerance value={slipTolerance} onChange={changeSlipTolerance} />
                        )}
                      </div>
                    </div>
                    <div className="flex w-full justify-between pl-10px text-[12px]">
                      <div
                        className={`flex items-center ${disableSlippage ? 'text-warning0 dark:text-warning0d' : ''}`}>
                        {intl.formatMessage({ id: 'swap.min.result.protected' })}
                        <InfoIcon
                          className={`ml-[3px] ${
                            disableSlippage ? '' : 'text-gray2 dark:text-gray2d'
                          } h-[15px] w-[15px]`}
                          color={disableSlippage ? 'warning' : 'neutral'}
                          tooltip={
                            disableSlippage
                              ? intl.formatMessage({ id: 'swap.slip.tolerance.ledger-disabled.info' })
                              : intl.formatMessage({ id: 'swap.min.result.info' }, { tolerance: slipTolerance })
                          }
                        />
                      </div>
                      <div>{swapMinResultLabel}</div>
                    </div>
                  </>
                )}

                {/* addresses */}
                {showDetails && (
                  <>
                    <div className={`w-full pt-10px font-mainBold text-[14px]`}>
                      {intl.formatMessage({ id: 'common.addresses' })}
                    </div>
                    {/* sender address */}
                    <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                      <div>{intl.formatMessage({ id: 'common.sender' })}</div>
                      <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                        {FP.pipe(
                          oSwapParams,
                          O.map(({ sender }) => (
                            <TooltipAddress title={sender} key="tooltip-sender-addr">
                              {sender}
                            </TooltipAddress>
                          )),
                          O.getOrElse(() => <>{noDataString}</>)
                        )}
                      </div>
                    </div>
                    {/* recipient address */}
                    <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                      <div>{intl.formatMessage({ id: 'common.recipient' })}</div>
                      <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                        {FP.pipe(
                          oTargetAddress,
                          O.map((address) => (
                            <TooltipAddress title={address} key="tooltip-target-addr">
                              {address}
                            </TooltipAddress>
                          )),
                          O.getOrElse(() => <>{noDataString}</>)
                        )}
                      </div>
                    </div>
                    {/* inbound address */}
                    {FP.pipe(
                      oSwapParams,
                      O.map(({ poolAddress: { address } }) =>
                        address ? (
                          <div className="flex w-full items-center justify-between pl-10px text-[12px]" key="pool-addr">
                            <div>{intl.formatMessage({ id: 'common.pool.inbound' })}</div>
                            <TooltipAddress title={address}>
                              <div className="truncate pl-20px text-[13px] normal-case leading-normal">{address}</div>
                            </TooltipAddress>
                          </div>
                        ) : null
                      ),
                      O.toNullable
                    )}
                  </>
                )}

                {/* memo */}
                {showDetails && (
                  <>
                    <div className="ml-[-2px] flex w-full items-start pt-10px font-mainBold text-[14px]">
                      {memoTitle}
                    </div>
                    <div className="truncate pl-10px font-main text-[12px]">{memoLabel}</div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="center mb-0 mt-30px font-main text-[12px] uppercase text-text2 dark:text-text2d">
              {!hasImportedKeystore(keystore)
                ? intl.formatMessage({ id: 'swap.note.nowallet' })
                : isLocked(keystore) && intl.formatMessage({ id: 'swap.note.lockedWallet' })}
            </p>
            <FlatButton className="my-30px min-w-[200px]" size="large" onClick={importWalletHandler}>
              {!hasImportedKeystore(keystore)
                ? intl.formatMessage({ id: 'wallet.add.label' })
                : isLocked(keystore) && intl.formatMessage({ id: 'wallet.unlock.label' })}
            </FlatButton>
          </>
        )}
      </div>

      {renderPasswordConfirmationModal}
      {renderLedgerConfirmationModal}
      {renderTxModal}
    </div>
  )
}
