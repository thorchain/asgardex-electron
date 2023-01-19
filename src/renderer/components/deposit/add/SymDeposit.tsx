import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'
import { getDepositMemo, PoolData } from '@thorchain/asgardex-util'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Address, Asset, baseAmount, BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/Predicate'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { AssetRuneNative } from '../../../../shared/utils/asset'
import { chainToString } from '../../../../shared/utils/chain'
import { isLedgerWallet } from '../../../../shared/utils/guard'
import { WalletType } from '../../../../shared/wallet/types'
import { ZERO_ASSET_AMOUNT, ZERO_BASE_AMOUNT } from '../../../const'
import {
  convertBaseAmountDecimal,
  getEthTokenAddress,
  isChainAsset,
  isEthAsset,
  isEthTokenAsset,
  isRuneNativeAsset,
  isUSDAsset,
  max1e8BaseAmount,
  THORCHAIN_DECIMAL,
  to1e8BaseAmount
} from '../../../helpers/assetHelper'
import { getChainAsset, isEthChain } from '../../../helpers/chainHelper'
import { unionAssets } from '../../../helpers/fp/array'
import { eqBaseAmount, eqOAsset, eqOApproveParams, eqAsset } from '../../../helpers/fp/eq'
import { sequenceSOption, sequenceTOption } from '../../../helpers/fpHelpers'
import * as PoolHelpers from '../../../helpers/poolHelper'
import { liveData, LiveData } from '../../../helpers/rx/liveData'
import { emptyString, hiddenString, loadingString, noDataString } from '../../../helpers/stringHelper'
import * as WalletHelper from '../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../hooks/useSubscriptionState'
import { INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import {
  SymDepositState,
  SymDepositParams,
  SymDepositStateHandler,
  SymDepositFees,
  FeeRD,
  ReloadSymDepositFeesHandler,
  SymDepositFeesHandler,
  SymDepositFeesRD
} from '../../../services/chain/types'
import { GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../services/clients'
import {
  ApproveFeeHandler,
  ApproveParams,
  IsApprovedRD,
  IsApproveParams,
  LoadApproveFeeHandler
} from '../../../services/ethereum/types'
import { PoolAddress, PoolDetails, PoolsDataMap } from '../../../services/midgard/types'
import {
  LiquidityProviderAssetMismatch,
  LiquidityProviderAssetMismatchRD,
  LiquidityProviderHasAsymAssets,
  LiquidityProviderHasAsymAssetsRD,
  PendingAssets,
  PendingAssetsRD
} from '../../../services/thorchain/types'
import {
  ApiError,
  BalancesState,
  TxHashLD,
  TxHashRD,
  ValidatePasswordHandler,
  WalletBalance,
  WalletBalances
} from '../../../services/wallet/types'
import { AssetWithAmount, AssetWithDecimal } from '../../../types/asgardex'
import { PricePool } from '../../../views/pools/Pools.types'
import { LedgerConfirmationModal } from '../../modal/confirmation'
import { WalletPasswordConfirmationModal } from '../../modal/confirmation'
import { TxModal } from '../../modal/tx'
import { DepositAssets } from '../../modal/tx/extra'
import { LoadingView } from '../../shared/loading'
import { Alert } from '../../uielements/alert'
import { AssetInput } from '../../uielements/assets/assetInput'
import { BaseButton, FlatButton, ViewTxButton } from '../../uielements/button'
import { MaxBalanceButton } from '../../uielements/button/MaxBalanceButton'
import { Tooltip, TooltipAddress } from '../../uielements/common/Common.styles'
import { Fees, UIFeesRD } from '../../uielements/fees'
import { InfoIcon } from '../../uielements/info/InfoIcon'
import { CopyLabel } from '../../uielements/label'
import { Slider } from '../../uielements/slider'
import { AssetMissmatchWarning } from './AssetMissmatchWarning'
import { AsymAssetsWarning } from './AsymAssetsWarning'
import * as Helper from './Deposit.helper'
import { PendingAssetsWarning } from './PendingAssetsWarning'

export type Props = {
  asset: AssetWithDecimal
  availableAssets: Asset[]
  walletBalances: Pick<BalancesState, 'balances' | 'loading'>
  poolAddress: O.Option<PoolAddress>
  pricePool: PricePool
  poolDetails: PoolDetails
  reloadFees: ReloadSymDepositFeesHandler
  fees$: SymDepositFeesHandler
  reloadApproveFee: LoadApproveFeeHandler
  approveFee$: ApproveFeeHandler
  reloadBalances: FP.Lazy<void>
  reloadShares: (delay?: number) => void
  reloadSelectedPoolDetail: (delay?: number) => void
  openAssetExplorerTxUrl: OpenExplorerTxUrl
  openRuneExplorerTxUrl: OpenExplorerTxUrl
  getRuneExplorerTxUrl: GetExplorerTxUrl
  getAssetExplorerTxUrl: GetExplorerTxUrl
  validatePassword$: ValidatePasswordHandler
  assetWalletType: WalletType
  runeWalletType: WalletType
  onChangeAsset: ({
    asset,
    assetWalletType,
    runeWalletType
  }: {
    asset: Asset
    assetWalletType: WalletType
    runeWalletType: WalletType
  }) => void
  disabled?: boolean
  poolData: PoolData
  deposit$: SymDepositStateHandler
  network: Network
  approveERC20Token$: (params: ApproveParams) => TxHashLD
  isApprovedERC20Token$: (params: IsApproveParams) => LiveData<ApiError, boolean>
  protocolLimitReached: boolean
  poolsData: PoolsDataMap
  disableDepositAction: boolean
  symPendingAssets: PendingAssetsRD
  openRecoveryTool: FP.Lazy<void>
  hasAsymAssets: LiquidityProviderHasAsymAssetsRD
  symAssetMismatch: LiquidityProviderAssetMismatchRD
  openAsymDepositTool: FP.Lazy<void>
  hidePrivateData: boolean
}

type SelectedInput = 'asset' | 'rune' | 'none'

export const SymDeposit: React.FC<Props> = (props) => {
  const {
    asset: { asset, decimal: assetDecimal },
    availableAssets,
    walletBalances,
    poolAddress: oPoolAddress,
    openAssetExplorerTxUrl,
    openRuneExplorerTxUrl,
    getRuneExplorerTxUrl,
    getAssetExplorerTxUrl,
    validatePassword$,
    pricePool,
    poolDetails,
    reloadFees,
    reloadBalances,
    reloadShares,
    reloadSelectedPoolDetail,
    fees$,
    assetWalletType,
    runeWalletType,
    onChangeAsset,
    disabled = false,
    poolData,
    deposit$,
    network,
    isApprovedERC20Token$,
    approveERC20Token$,
    reloadApproveFee,
    approveFee$,
    protocolLimitReached,
    poolsData,
    disableDepositAction,
    symPendingAssets: symPendingAssetsRD,
    openRecoveryTool,
    hasAsymAssets: hasAsymAssetsRD,
    symAssetMismatch: symAssetMismatchRD,
    openAsymDepositTool,
    hidePrivateData
  } = props

  const intl = useIntl()

  const { chain } = asset

  const prevAsset = useRef<O.Option<Asset>>(O.none)

  const isRuneLedger = isLedgerWallet(runeWalletType)
  const isAssetLedger = isLedgerWallet(assetWalletType)

  const { balances: oWalletBalances, loading: walletBalancesLoading } = walletBalances

  const poolBasedBalances: WalletBalances = useMemo(
    () =>
      FP.pipe(
        oWalletBalances,
        O.map((balances) => WalletHelper.filterWalletBalancesByAssets(balances, availableAssets)),
        O.getOrElse<WalletBalances>(() => [])
      ),
    [oWalletBalances, availableAssets]
  )

  const poolBasedBalancesAssets = FP.pipe(
    poolBasedBalances,
    A.map(({ asset }) => asset),
    // Merge duplications
    (assets) => unionAssets(assets)(assets),
    // Filter RUNE out - not selectable on asset side
    A.filter(P.not(isRuneNativeAsset))
  )

  const oRuneWB: O.Option<WalletBalance> = useMemo(() => {
    const oWalletBalances = NEA.fromArray(poolBasedBalances)
    return WalletHelper.getWalletBalanceByAssetAndWalletType({
      oWalletBalances,
      asset: AssetRuneNative,
      walletType: runeWalletType
    })
  }, [runeWalletType, poolBasedBalances])

  const runeBalanceLabel = useMemo(
    () =>
      walletBalancesLoading
        ? loadingString
        : FP.pipe(
            oRuneWB,
            O.map(({ amount, asset }) =>
              hidePrivateData
                ? hiddenString
                : formatAssetAmountCurrency({
                    amount: baseToAsset(amount),
                    asset,
                    decimal: 8,
                    trimZeros: true
                  })
            ),
            O.getOrElse(() => noDataString)
          ),
    [hidePrivateData, oRuneWB, walletBalancesLoading]
  )

  const oAssetWB: O.Option<WalletBalance> = useMemo(() => {
    const oWalletBalances = NEA.fromArray(poolBasedBalances)
    return WalletHelper.getWalletBalanceByAssetAndWalletType({
      oWalletBalances,
      asset,
      walletType: assetWalletType
    })
  }, [asset, assetWalletType, poolBasedBalances])

  const assetBalanceLabel = useMemo(
    () =>
      walletBalancesLoading
        ? loadingString
        : FP.pipe(
            oAssetWB,
            O.map(({ amount, asset }) =>
              hidePrivateData
                ? hiddenString
                : formatAssetAmountCurrency({
                    amount: baseToAsset(amount),
                    asset,
                    decimal: 8,
                    trimZeros: true
                  })
            ),
            O.getOrElse(() => noDataString)
          ),
    [hidePrivateData, oAssetWB, walletBalancesLoading]
  )

  const hasAssetLedger = useMemo(
    () => WalletHelper.hasLedgerInBalancesByAsset(asset, poolBasedBalances),
    [asset, poolBasedBalances]
  )

  const hasRuneLedger = useMemo(
    () => WalletHelper.hasLedgerInBalancesByAsset(AssetRuneNative, poolBasedBalances),
    [poolBasedBalances]
  )

  /** Asset balance based on original decimal */
  const assetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oAssetWB,
        O.map(({ amount }) => amount),
        O.getOrElse(() => baseAmount(0, assetDecimal))
      ),
    [assetDecimal, oAssetWB]
  )

  const assetBalanceMax1e8: BaseAmount = useMemo(() => max1e8BaseAmount(assetBalance), [assetBalance])

  const [runeAmountToDeposit, setRuneAmountToDeposit] = useState<BaseAmount>(baseAmount(0, THORCHAIN_DECIMAL))

  const initialAssetAmountToDepositMax1e8 = useMemo(
    () => baseAmount(0, assetBalanceMax1e8.decimal),
    [assetBalanceMax1e8.decimal]
  )

  const priceRuneAmountToDepositMax1e8: AssetWithAmount = useMemo(
    () =>
      FP.pipe(
        PoolHelpers.getPoolPriceValue({
          balance: { asset: AssetRuneNative, amount: runeAmountToDeposit },
          poolDetails,
          pricePool,
          network
        }),
        O.getOrElse(() => ZERO_BASE_AMOUNT),
        (amount) => ({ asset: pricePool.asset, amount })
      ),
    [network, poolDetails, pricePool, runeAmountToDeposit]
  )

  const [
    /* max. 1e8 decimal */
    assetAmountToDepositMax1e8,
    _setAssetAmountToDepositMax1e8 /* private, never set it directly, use `setAssetAmountToDeposit` instead */
  ] = useState<BaseAmount>(initialAssetAmountToDepositMax1e8)

  const isZeroAmountToDeposit = useMemo(
    () => assetAmountToDepositMax1e8.amount().isZero() || runeAmountToDeposit.amount().isZero(),
    [assetAmountToDepositMax1e8, runeAmountToDeposit]
  )

  const [percentValueToDeposit, setPercentValueToDeposit] = useState(0)

  const [selectedInput, setSelectedInput] = useState<SelectedInput>('none')

  const {
    state: depositState,
    reset: resetDepositState,
    subscribe: subscribeDepositState
  } = useSubscriptionState<SymDepositState>(INITIAL_SYM_DEPOSIT_STATE)

  // Deposit start time
  const [depositStartTime, setDepositStartTime] = useState<number>(0)

  const runeBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneWB,
        O.map(({ amount }) => amount),
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneWB]
  )

  const oChainAssetBalance: O.Option<BaseAmount> = useMemo(() => {
    const chainAsset = getChainAsset(chain)
    return FP.pipe(
      WalletHelper.getWalletBalanceByAssetAndWalletType({
        oWalletBalances,
        asset: chainAsset,
        walletType: assetWalletType
      }),
      O.map(({ amount }) => amount)
    )
  }, [chain, oWalletBalances, assetWalletType])

  const chainAssetBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oChainAssetBalance,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oChainAssetBalance]
  )

  const needApprovement = useMemo(() => {
    // Other chains than ETH do not need an approvement
    if (!isEthChain(chain)) return false
    // ETH does not need to be approved
    if (isEthAsset(asset)) return false
    // ERC20 token does need approvement only
    return isEthTokenAsset(asset)
  }, [asset, chain])

  const oApproveParams: O.Option<ApproveParams> = useMemo(() => {
    const oRouterAddress: O.Option<Address> = FP.pipe(
      oPoolAddress,
      O.chain(({ router }) => router)
    )
    const oTokenAddress: O.Option<string> = getEthTokenAddress(asset)

    const oNeedApprovement: O.Option<boolean> = FP.pipe(
      needApprovement,
      // `None` if needApprovement is `false`, no request then
      O.fromPredicate((v) => !!v)
    )

    return FP.pipe(
      sequenceTOption(oNeedApprovement, oTokenAddress, oRouterAddress, oAssetWB),
      O.map(([_, tokenAddress, routerAddress, { walletAddress, walletIndex, walletType, hdMode }]) => ({
        network,
        spenderAddress: routerAddress,
        contractAddress: tokenAddress,
        fromAddress: walletAddress,
        walletIndex,
        walletType,
        hdMode
      }))
    )
  }, [oPoolAddress, asset, needApprovement, oAssetWB, network])

  const zeroDepositFees: SymDepositFees = useMemo(() => Helper.getZeroSymDepositFees(asset), [asset])

  const prevDepositFees = useRef<O.Option<SymDepositFees>>(O.none)

  const [depositFeesRD] = useObservableState<SymDepositFeesRD>(
    () =>
      FP.pipe(
        fees$(asset),
        liveData.map((fees) => {
          // store every successfully loaded fees
          prevDepositFees.current = O.some(fees)
          return fees
        })
      ),
    RD.success(zeroDepositFees)
  )

  const depositFees: SymDepositFees = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.toOption,
        O.alt(() => prevDepositFees.current),
        O.getOrElse(() => zeroDepositFees)
      ),
    [depositFeesRD, zeroDepositFees]
  )

  const runeFeeLabel: string = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ rune: { inFee, outFee } }) =>
            formatAssetAmountCurrency({
              amount: baseToAsset(inFee.plus(outFee)),
              asset: AssetRuneNative,
              decimal: 6,
              trimZeros: true
            })
        )
      ),
    [depositFeesRD]
  )

  const assetFeeLabel: string = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ asset: { inFee, outFee, asset: feeAsset } }) =>
            formatAssetAmountCurrency({
              amount: baseToAsset(inFee.plus(outFee)),
              asset: feeAsset,
              decimal: isUSDAsset(feeAsset) ? 2 : 6,
              trimZeros: !isUSDAsset(feeAsset)
            })
        )
      ),

    [depositFeesRD]
  )

  // Price of RUNE IN fee
  const oPriceRuneInFee: O.Option<AssetWithAmount> = useMemo(() => {
    const amount = depositFees.rune.inFee

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset: AssetRuneNative, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ amount, asset: pricePool.asset }))
    )
  }, [network, poolDetails, pricePool, depositFees])

  const priceRuneInFeeLabel = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ rune: { inFee } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(inFee),
              asset: AssetRuneNative,
              decimal: 6,
              trimZeros: true
            })
            const price = FP.pipe(
              oPriceRuneInFee,
              O.map(({ amount, asset: priceAsset }) =>
                isRuneNativeAsset(priceAsset)
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

    [depositFeesRD, oPriceRuneInFee]
  )

  // Price of RUNE OUT fee
  const oPriceRuneOutFee: O.Option<AssetWithAmount> = useMemo(() => {
    const amount = depositFees.rune.outFee

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset: AssetRuneNative, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ asset: pricePool.asset, amount }))
    )
  }, [network, poolDetails, pricePool, depositFees])

  const priceRuneOutFeeLabel = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ rune: { outFee } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(outFee),
              asset: AssetRuneNative,
              decimal: 6,
              trimZeros: true
            })
            const price = FP.pipe(
              oPriceRuneOutFee,
              O.map(({ amount, asset: priceAsset }) =>
                isRuneNativeAsset(priceAsset)
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

    [depositFeesRD, oPriceRuneOutFee]
  )

  // Price of asset IN fee
  const oPriceAssetInFee: O.Option<AssetWithAmount> = useMemo(() => {
    const asset = depositFees.asset.asset
    const amount = depositFees.asset.inFee

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ amount, asset: pricePool.asset }))
    )
  }, [network, poolDetails, pricePool, depositFees])

  const priceAssetInFeeLabel = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ asset: { inFee, asset: feeAsset } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(inFee),
              asset: feeAsset,
              decimal: isUSDAsset(feeAsset) ? 2 : 6,
              trimZeros: !isUSDAsset(feeAsset)
            })
            const price = FP.pipe(
              oPriceAssetInFee,
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

    [depositFeesRD, oPriceAssetInFee]
  )

  // Price of asset OUT fee
  const oPriceAssetOutFee: O.Option<AssetWithAmount> = useMemo(() => {
    const asset = depositFees.asset.asset
    const amount = depositFees.asset.outFee

    return FP.pipe(
      PoolHelpers.getPoolPriceValue({
        balance: { asset, amount },
        poolDetails,
        pricePool,
        network
      }),
      O.map((amount) => ({ asset: pricePool.asset, amount }))
    )
  }, [network, poolDetails, pricePool, depositFees])

  const priceAssetOutFeeLabel = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          ({ asset: { outFee, asset: feeAsset } }) => {
            const fee = formatAssetAmountCurrency({
              amount: baseToAsset(outFee),
              asset: feeAsset,
              decimal: isUSDAsset(feeAsset) ? 2 : 6,
              trimZeros: !isUSDAsset(feeAsset)
            })
            const price = FP.pipe(
              oPriceAssetOutFee,
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

    [depositFeesRD, oPriceAssetOutFee]
  )

  /**
   * Sum price of deposit fees (IN + OUT)
   */
  const oPriceDepositFees1e8: O.Option<AssetWithAmount> = useMemo(
    () =>
      FP.pipe(
        sequenceSOption({
          priceRuneInFee: oPriceRuneInFee,
          priceRuneOutFee: oPriceRuneOutFee,
          priceAssetInFee: oPriceAssetInFee,
          priceAssetOutFee: oPriceAssetOutFee
        }),
        O.map(({ priceRuneInFee, priceRuneOutFee, priceAssetInFee, priceAssetOutFee }) => {
          const sumRune = priceRuneInFee.amount.plus(priceRuneOutFee.amount)
          const assetIn1e8 = to1e8BaseAmount(priceAssetInFee.amount)
          const assetOut1e8 = to1e8BaseAmount(priceAssetOutFee.amount)
          const sumAsset1e8 = assetIn1e8.plus(assetOut1e8)
          return { asset: priceAssetInFee.asset, amount: sumRune.plus(sumAsset1e8) }
        })
      ),
    [oPriceAssetInFee, oPriceAssetOutFee, oPriceRuneInFee, oPriceRuneOutFee]
  )

  const priceDepositFeesLabel = useMemo(
    () =>
      FP.pipe(
        depositFeesRD,
        RD.fold(
          () => loadingString,
          () => loadingString,
          () => noDataString,
          (_) =>
            FP.pipe(
              oPriceDepositFees1e8,
              O.map(({ amount, asset }) =>
                formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: isUSDAsset(asset) ? 2 : 6 })
              ),
              O.getOrElse(() => noDataString)
            )
        )
      ),
    [depositFeesRD, oPriceDepositFees1e8]
  )

  const oDepositParams: O.Option<SymDepositParams> = useMemo(
    () =>
      FP.pipe(
        sequenceSOption({ poolAddress: oPoolAddress, runeWB: oRuneWB, assetWB: oAssetWB }),
        O.map(({ poolAddress, runeWB, assetWB }) => {
          const assetAddress = assetWB.walletAddress
          const runeAddress = runeWB.walletAddress
          return {
            asset,
            poolAddress,
            amounts: {
              rune: runeAmountToDeposit,
              // Decimal needs to be converted back for using orginal decimal of this asset (provided by `assetBalance`)
              asset: convertBaseAmountDecimal(assetAmountToDepositMax1e8, assetDecimal)
            },
            memos: {
              asset: getDepositMemo({ asset, address: runeAddress }),
              rune: getDepositMemo({ asset, address: assetAddress })
            },
            runeWalletType: runeWB.walletType,
            runeWalletIndex: runeWB.walletIndex,
            runeHDMode: runeWB.hdMode,
            runeSender: runeAddress,
            assetWalletType: assetWB.walletType,
            assetWalletIndex: assetWB.walletIndex,
            assetHDMode: assetWB.hdMode,
            assetSender: assetAddress
          }
        })
      ),
    [oPoolAddress, oRuneWB, oAssetWB, asset, runeAmountToDeposit, assetAmountToDepositMax1e8, assetDecimal]
  )

  const reloadFeesHandler = useCallback(() => {
    reloadFees(asset)
  }, [asset, reloadFees])

  const prevApproveFee = useRef<O.Option<BaseAmount>>(O.none)

  const [approveFeeRD, approveFeesParamsUpdated] = useObservableState<FeeRD, ApproveParams>((approveFeeParam$) => {
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

  // Update `approveFeesRD` whenever `oApproveParams` has been changed
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
        approveFeesParamsUpdated(params)
        checkApprovedStatus(params)
        return true
      })
    )
  }, [approveFeesParamsUpdated, checkApprovedStatus, oApproveParams, oPoolAddress])

  const reloadApproveFeesHandler = useCallback(() => {
    FP.pipe(oApproveParams, O.map(reloadApproveFee))
  }, [oApproveParams, reloadApproveFee])

  const minAssetAmountToDepositMax1e8: BaseAmount = useMemo(
    () => Helper.minAssetAmountToDepositMax1e8({ fees: depositFees.asset, asset, assetDecimal, poolsData }),
    [asset, assetDecimal, depositFees.asset, poolsData]
  )

  const minAssetAmountError = useMemo(() => {
    if (isZeroAmountToDeposit) return false

    return assetAmountToDepositMax1e8.lt(minAssetAmountToDepositMax1e8)
  }, [assetAmountToDepositMax1e8, isZeroAmountToDeposit, minAssetAmountToDepositMax1e8])

  const minRuneAmountToDeposit: BaseAmount = useMemo(
    () => Helper.minRuneAmountToDeposit(depositFees.rune),
    [depositFees.rune]
  )

  const minRuneAmountError = useMemo(() => {
    if (isZeroAmountToDeposit) return false

    return runeAmountToDeposit.lt(minRuneAmountToDeposit)
  }, [isZeroAmountToDeposit, minRuneAmountToDeposit, runeAmountToDeposit])

  const maxRuneAmountToDeposit = useMemo(
    (): BaseAmount =>
      Helper.maxRuneAmountToDeposit({
        poolData,
        runeBalance,
        assetBalance: { asset, amount: assetBalance },
        fees: depositFees
      }),

    [asset, assetBalance, depositFees, poolData, runeBalance]
  )

  // Update `runeAmountToDeposit` if `maxRuneAmountToDeposit` has been updated
  useEffect(() => {
    if (maxRuneAmountToDeposit.lt(runeAmountToDeposit)) {
      setRuneAmountToDeposit(maxRuneAmountToDeposit)
    }
  }, [maxRuneAmountToDeposit, runeAmountToDeposit])

  /**
   * Max asset amount to deposit
   * Note: It's max. 1e8 decimal based
   */
  const maxAssetAmountToDepositMax1e8 = useMemo((): BaseAmount => {
    const maxAmount = Helper.maxAssetAmountToDeposit({
      poolData,
      runeBalance,
      assetBalance: { asset, amount: assetBalance },
      fees: depositFees
    })
    return max1e8BaseAmount(maxAmount)
  }, [asset, assetBalance, depositFees, poolData, runeBalance])

  const setAssetAmountToDepositMax1e8 = useCallback(
    (amountToDeposit: BaseAmount) => {
      const newAmount = baseAmount(amountToDeposit.amount(), assetBalanceMax1e8.decimal)

      // dirty check - do nothing if prev. and next amounts are equal
      if (eqBaseAmount.equals(newAmount, assetAmountToDepositMax1e8)) return {}

      const newAmountToDepositMax1e8 = newAmount.gt(maxAssetAmountToDepositMax1e8)
        ? maxAssetAmountToDepositMax1e8
        : newAmount

      _setAssetAmountToDepositMax1e8({ ...newAmountToDepositMax1e8 })
    },
    [assetAmountToDepositMax1e8, assetBalanceMax1e8.decimal, maxAssetAmountToDepositMax1e8]
  )

  // Update `assetAmountToDeposit` if `maxAssetAmountToDeposit` has been updated
  useEffect(() => {
    if (maxAssetAmountToDepositMax1e8.lt(assetAmountToDepositMax1e8)) {
      setAssetAmountToDepositMax1e8(maxAssetAmountToDepositMax1e8)
    }
  }, [assetAmountToDepositMax1e8, maxAssetAmountToDepositMax1e8, setAssetAmountToDepositMax1e8])

  const priceAssetAmountToDepositMax1e8: AssetWithAmount = useMemo(
    () =>
      FP.pipe(
        PoolHelpers.getPoolPriceValue({
          balance: { asset, amount: assetAmountToDepositMax1e8 },
          poolDetails,
          pricePool,
          network
        }),
        O.getOrElse(() => baseAmount(0, assetAmountToDepositMax1e8.decimal)),
        (amount) => ({ asset: pricePool.asset, amount })
      ),
    [asset, assetAmountToDepositMax1e8, network, poolDetails, pricePool]
  )

  const hasAssetBalance = useMemo(() => assetBalance.gt(baseAmount(0, assetBalance.decimal)), [assetBalance])
  const hasRuneBalance = useMemo(() => runeBalance.gt(ZERO_BASE_AMOUNT), [runeBalance])

  const isBalanceError = useMemo(() => !hasAssetBalance && !hasRuneBalance, [hasAssetBalance, hasRuneBalance])

  const showBalanceError = useMemo(
    () =>
      // Note:
      // To avoid flickering of balance error for a short time at the beginning
      // We never show error if balances are not available
      O.isSome(oAssetWB) && isBalanceError,
    [isBalanceError, oAssetWB]
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

    return <Alert className="m-0 w-full xl:mr-20px" type="warning" message={title} description={msg} />
  }, [asset.ticker, hasAssetBalance, hasRuneBalance, intl])

  const updateRuneAmount = useCallback(
    (newAmount: BaseAmount) => {
      let runeAmount = newAmount.gt(maxRuneAmountToDeposit)
        ? { ...maxRuneAmountToDeposit } // Use copy to avoid missmatch with values in input fields
        : newAmount
      // assetAmount max. 1e8 decimal
      const assetAmountMax1e8 = Helper.getAssetAmountToDeposit({
        runeAmount,
        poolData,
        assetDecimal
      })

      if (assetAmountMax1e8.gt(maxAssetAmountToDepositMax1e8)) {
        runeAmount = Helper.getRuneAmountToDeposit(maxAssetAmountToDepositMax1e8, poolData)
        setRuneAmountToDeposit(runeAmount)
        setAssetAmountToDepositMax1e8(maxAssetAmountToDepositMax1e8)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeAmount)
        setAssetAmountToDepositMax1e8(assetAmountMax1e8)
        // formula: runeQuantity * 100 / maxRuneAmountToDeposit
        const percentToDeposit = maxRuneAmountToDeposit.gt(ZERO_BASE_AMOUNT)
          ? runeAmount.times(100).div(maxRuneAmountToDeposit).amount().toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [assetDecimal, maxAssetAmountToDepositMax1e8, maxRuneAmountToDeposit, poolData, setAssetAmountToDepositMax1e8]
  )

  const runeAmountChangeHandler = useCallback(
    (amount: BaseAmount) => {
      // Do nothing if we don't entered input for rune
      if (selectedInput !== 'rune') return

      updateRuneAmount(amount)
    },
    [selectedInput, updateRuneAmount]
  )

  const updateAssetAmount = useCallback(
    (newAmount: BaseAmount) => {
      // make sure we use correct decimal based on assetBalanceForThorchain
      // (input's decimal might not be updated yet)
      const newAmountMax1e8 = convertBaseAmountDecimal(newAmount, assetBalanceMax1e8.decimal)

      let assetAmountMax1e8 = newAmountMax1e8.gt(maxAssetAmountToDepositMax1e8)
        ? { ...maxAssetAmountToDepositMax1e8 } // Use copy to avoid missmatch with values in input fields
        : { ...newAmountMax1e8 }
      const runeAmount = Helper.getRuneAmountToDeposit(assetAmountMax1e8, poolData)

      if (runeAmount.gt(maxRuneAmountToDeposit)) {
        assetAmountMax1e8 = Helper.getAssetAmountToDeposit({
          runeAmount,
          poolData,
          assetDecimal
        })
        setRuneAmountToDeposit(maxRuneAmountToDeposit)
        setAssetAmountToDepositMax1e8(assetAmountMax1e8)
        setPercentValueToDeposit(100)
      } else {
        setRuneAmountToDeposit(runeAmount)
        setAssetAmountToDepositMax1e8(assetAmountMax1e8)
        // assetQuantity * 100 / maxAssetAmountToDeposit
        const percentToDeposit = maxAssetAmountToDepositMax1e8.gt(baseAmount(0, maxAssetAmountToDepositMax1e8.decimal))
          ? assetAmountMax1e8.times(100).div(maxAssetAmountToDepositMax1e8).amount().toNumber()
          : 0
        setPercentValueToDeposit(percentToDeposit)
      }
    },
    [
      assetBalanceMax1e8.decimal,
      assetDecimal,
      maxAssetAmountToDepositMax1e8,
      maxRuneAmountToDeposit,
      poolData,
      setAssetAmountToDepositMax1e8
    ]
  )

  const assetAmountChangeHandler = useCallback(
    (amount: BaseAmount) => {
      // Do nothing if we don't entered input for asset
      if (selectedInput !== 'asset') return

      updateAssetAmount(amount)
    },
    [selectedInput, updateAssetAmount]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const runeAmountBN = maxRuneAmountToDeposit
        .amount()
        .dividedBy(100)
        .multipliedBy(percent)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)
      const assetAmountMax1e8BN = maxAssetAmountToDepositMax1e8
        .amount()
        .dividedBy(100)
        .multipliedBy(percent)
        .decimalPlaces(0, BigNumber.ROUND_DOWN)

      setRuneAmountToDeposit(baseAmount(runeAmountBN, maxRuneAmountToDeposit.decimal))
      setAssetAmountToDepositMax1e8(baseAmount(assetAmountMax1e8BN, assetBalanceMax1e8.decimal))
      setPercentValueToDeposit(percent)
    },
    [assetBalanceMax1e8.decimal, maxAssetAmountToDepositMax1e8, maxRuneAmountToDeposit, setAssetAmountToDepositMax1e8]
  )

  const onChangeAssetHandler = useCallback(
    (asset: Asset) => {
      onChangeAsset({ asset, assetWalletType, runeWalletType })
    },
    [assetWalletType, onChangeAsset, runeWalletType]
  )

  const onAfterSliderChangeHandler = useCallback(() => {
    if (selectedInput === 'none') {
      reloadFeesHandler()
    }
  }, [reloadFeesHandler, selectedInput])

  type ModalState = 'deposit' | 'approve' | 'none'
  const [showPasswordModal, setShowPasswordModal] = useState<ModalState>('none')
  const [showLedgerModal, setShowLedgerModal] = useState<ModalState>('none')

  const onSubmit = () => {
    if (isAssetLedger || isRuneLedger) {
      setShowLedgerModal('deposit')
    } else {
      setShowPasswordModal('deposit')
    }
  }

  const renderFeeError = useCallback(
    (fee: BaseAmount, amount: BaseAmount, asset: Asset) => {
      const msg = intl.formatMessage(
        { id: 'deposit.add.error.chainFeeNotCovered' },
        {
          fee: formatAssetAmountCurrency({
            asset: getChainAsset(chain),
            trimZeros: true,
            amount: baseToAsset(fee)
          }),
          balance: formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, trimZeros: true })
        }
      )

      return (
        <p className="mb-20px p-0 text-center font-main text-[12px] uppercase text-error0 dark:text-error0d">{msg}</p>
      )
    },
    [chain, intl]
  )

  const isThorchainFeeError = useMemo(() => {
    // ignore error check by having zero amounts
    if (isZeroAmountToDeposit) return false

    return FP.pipe(
      oRuneWB,
      O.fold(
        () => true,
        ({ amount }) => FP.pipe(depositFees.rune, Helper.minBalanceToDeposit, amount.lt)
      )
    )
  }, [isZeroAmountToDeposit, oRuneWB, depositFees.rune])

  const renderThorchainFeeError = useMemo(() => {
    if (!isThorchainFeeError || isBalanceError /* Don't render anything in case of fees or balance errors */)
      return <></>

    return renderFeeError(Helper.minBalanceToDeposit(depositFees.rune), runeBalance, AssetRuneNative)
  }, [depositFees.rune, isBalanceError, isThorchainFeeError, renderFeeError, runeBalance])

  const isAssetChainFeeError = useMemo(() => {
    // ignore error check by having zero amounts
    if (isZeroAmountToDeposit) return false

    return FP.pipe(
      oChainAssetBalance,
      O.fold(
        () => true,
        (balance) => FP.pipe(depositFees.asset, Helper.minBalanceToDeposit, balance.lt)
      )
    )
  }, [isZeroAmountToDeposit, oChainAssetBalance, depositFees.asset])

  const renderAssetChainFeeError = useMemo(() => {
    if (!isAssetChainFeeError || isBalanceError /* Don't render anything in case of fees or balance errors */)
      return <></>

    return renderFeeError(Helper.minBalanceToDeposit(depositFees.asset), chainAssetBalance, getChainAsset(chain))
  }, [isAssetChainFeeError, isBalanceError, renderFeeError, depositFees.asset, chainAssetBalance, chain])

  const txModalExtraContent = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: asset.ticker }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: AssetRuneNative.ticker }),
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
        target={{ asset: AssetRuneNative, amount: runeAmountToDeposit }}
        source={O.some({ asset, amount: assetAmountToDepositMax1e8 })}
        stepDescription={stepDescription}
        network={network}
      />
    )
  }, [intl, asset, depositState, assetAmountToDepositMax1e8, runeAmountToDeposit, network])

  const onCloseTxModal = useCallback(() => {
    resetDepositState()
    changePercentHandler(0)
  }, [resetDepositState, changePercentHandler])

  const onFinishTxModal = useCallback(() => {
    onCloseTxModal()
    reloadBalances()
    reloadShares(5000)
    reloadSelectedPoolDetail(5000)
  }, [onCloseTxModal, reloadBalances, reloadSelectedPoolDetail, reloadShares])

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
      <div className="flex flex-col items-center justify-between">
        {FP.pipe(symDepositTxs.asset, RD.toOption, (oTxHash) => (
          <ViewTxButton
            className="pb-20px"
            txHash={oTxHash}
            onClick={openAssetExplorerTxUrl}
            txUrl={FP.pipe(oTxHash, O.chain(getAssetExplorerTxUrl))}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: asset.ticker })}
          />
        ))}
        {FP.pipe(symDepositTxs.rune, RD.toOption, (oTxHash) => (
          <ViewTxButton
            txHash={oTxHash}
            onClick={openRuneExplorerTxUrl}
            txUrl={FP.pipe(oTxHash, O.chain(getRuneExplorerTxUrl))}
            label={intl.formatMessage({ id: 'common.tx.view' }, { assetTicker: AssetRuneNative.ticker })}
          />
        ))}
      </div>
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
    openAssetExplorerTxUrl,
    getAssetExplorerTxUrl,
    asset.ticker,
    openRuneExplorerTxUrl,
    getRuneExplorerTxUrl
  ])

  const submitDepositTx = useCallback(() => {
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
  }, [oDepositParams, subscribeDepositState, deposit$])

  const inputOnBlur = useCallback(() => {
    setSelectedInput('none')
    reloadFeesHandler()
  }, [reloadFeesHandler])

  const uiApproveFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        approveFeeRD,
        RD.map((approveFee) => [{ asset: getChainAsset(chain), amount: approveFee }])
      ),
    [approveFeeRD, chain]
  )

  const isApproveFeeError = useMemo(() => {
    // ignore error check if we don't need to check allowance
    if (!needApprovement) return false

    return FP.pipe(
      oChainAssetBalance,
      O.fold(
        () => true,
        (balance) => FP.pipe(approveFee, balance.lt)
      )
    )
  }, [needApprovement, oChainAssetBalance, approveFee])

  const renderApproveFeeError = useMemo(() => {
    if (
      !isApproveFeeError ||
      // Don't render anything if chainAssetBalance is not available (still loading)
      O.isNone(oChainAssetBalance) ||
      // Don't render error if walletBalances are still loading
      walletBalancesLoading
    )
      return <></>

    return renderFeeError(approveFee, chainAssetBalance, getChainAsset(chain))
  }, [
    isApproveFeeError,
    oChainAssetBalance,
    walletBalancesLoading,
    renderFeeError,
    approveFee,
    chainAssetBalance,
    chain
  ])

  const {
    state: approveState,
    reset: resetApproveState,
    subscribe: subscribeApproveState
  } = useSubscriptionState<TxHashRD>(RD.initial)

  const onApprove = useCallback(() => {
    if (isAssetLedger) {
      setShowLedgerModal('approve')
    } else {
      setShowPasswordModal('approve')
    }
  }, [isAssetLedger])

  const submitApproveTx = useCallback(() => {
    FP.pipe(
      oApproveParams,
      O.map(({ walletIndex, walletType, contractAddress, spenderAddress, fromAddress, hdMode }) =>
        subscribeApproveState(
          approveERC20Token$({
            network,
            contractAddress,
            spenderAddress,
            fromAddress,
            walletIndex,
            walletType,
            hdMode
          })
        )
      )
    )
  }, [approveERC20Token$, network, oApproveParams, subscribeApproveState])

  const renderApproveError = useMemo(
    () =>
      FP.pipe(
        approveState,
        RD.fold(
          () => <></>,
          () => <></>,
          (error) => (
            <p className="mb-20px p-0 text-center font-main uppercase text-error0 dark:text-error0d">{error.msg}</p>
          ),
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
          <p className="mb-20px p-0 text-center font-main text-[12px] uppercase text-error0 dark:text-error0d">
            {intl.formatMessage({ id: 'common.approve.error' }, { asset: asset.ticker, error: error.msg })}
          </p>
        ),
        (_) => <></>
      )
    )
  }, [checkIsApprovedError, intl, isApprovedState, asset])

  const hasPendingAssets: boolean = useMemo(
    () =>
      FP.pipe(
        symPendingAssetsRD,
        RD.toOption,
        O.map((pendingAssets): boolean => pendingAssets.length > 0),
        O.getOrElse((): boolean => false)
      ),
    [symPendingAssetsRD]
  )

  const hasAsymDeposits: boolean = useMemo(
    () =>
      FP.pipe(
        hasAsymAssetsRD,
        RD.toOption,
        O.map(({ rune, asset }) => rune || asset),
        O.getOrElse((): boolean => false)
      ),
    [hasAsymAssetsRD]
  )

  const prevPendingAssets = useRef<PendingAssets>([])

  const renderPendingAssets = useMemo(() => {
    const render = (pendingAssets: PendingAssets, loading: boolean) =>
      pendingAssets.length && (
        <PendingAssetsWarning
          className="m-0 w-full xl:mr-20px"
          network={network}
          assets={pendingAssets}
          loading={loading}
          onClickRecovery={openRecoveryTool}
        />
      )

    return FP.pipe(
      symPendingAssetsRD,
      RD.fold(
        () => <></>,
        () => render(prevPendingAssets.current, true),
        () => <></>,
        (pendingAssets) => {
          prevPendingAssets.current = pendingAssets
          return render(pendingAssets, false)
        }
      )
    )
  }, [network, openRecoveryTool, symPendingAssetsRD])

  const prevHasAsymAssets = useRef<LiquidityProviderHasAsymAssets>({ rune: false, asset: false })

  const renderAsymDepositWarning = useMemo(() => {
    const render = ({ rune, asset: hasAsset }: LiquidityProviderHasAsymAssets, loading: boolean) => {
      const assets = FP.pipe(
        // Add optional assets to list
        [rune ? O.some(AssetRuneNative) : O.none, hasAsset ? O.some(asset) : O.none],
        // filter `None` out from list
        A.filterMap(FP.identity)
      )
      return (
        <AsymAssetsWarning
          className="m-0 w-full xl:mr-20px"
          network={network}
          assets={assets}
          loading={loading}
          onClickOpenAsymTool={openAsymDepositTool}
        />
      )
    }
    return FP.pipe(
      hasAsymAssetsRD,
      RD.fold(
        () => <></>,
        () => render(prevHasAsymAssets.current, true),
        () => <></>,
        (hasAssets) => {
          prevHasAsymAssets.current = hasAssets
          return render(hasAssets, false)
        }
      )
    )
  }, [asset, hasAsymAssetsRD, network, openAsymDepositTool])

  const hasAssetMismatch: boolean = useMemo(
    () => FP.pipe(RD.toOption(symAssetMismatchRD), O.flatten, O.isSome),
    [symAssetMismatchRD]
  )

  const prevAssetMismatch = useRef<LiquidityProviderAssetMismatch>(O.none)

  const renderAssetMismatch = useMemo(() => {
    const render = (assetMismatch: LiquidityProviderAssetMismatch) =>
      FP.pipe(
        assetMismatch,
        O.fold(
          () => <></>,
          ({ runeAddress, assetAddress }) => (
            <AssetMissmatchWarning
              className="m-0 w-full xl:mr-20px"
              assets={[
                { asset, address: assetAddress },
                { asset: AssetRuneNative, address: runeAddress }
              ]}
              network={network}
            />
          )
        )
      )

    return FP.pipe(
      symAssetMismatchRD,
      RD.fold(
        () => <></>,
        () => render(prevAssetMismatch.current),
        () => <></>,
        (assetMismatch) => {
          prevAssetMismatch.current = assetMismatch
          return render(assetMismatch)
        }
      )
    )
  }, [asset, network, symAssetMismatchRD])

  const resetEnteredAmounts = useCallback(() => {
    setRuneAmountToDeposit(baseAmount(0, THORCHAIN_DECIMAL))
    setAssetAmountToDepositMax1e8(initialAssetAmountToDepositMax1e8)
    setPercentValueToDeposit(0)
  }, [initialAssetAmountToDepositMax1e8, setAssetAmountToDepositMax1e8])

  const useRuneLedgerHandler = useCallback(
    (useLedger: boolean) => {
      const walletType: WalletType = useLedger ? 'ledger' : 'keystore'
      onChangeAsset({ asset, assetWalletType, runeWalletType: walletType })
      resetEnteredAmounts()
    },

    [asset, assetWalletType, onChangeAsset, resetEnteredAmounts]
  )

  const useAssetLedgerHandler = useCallback(
    (useLedger: boolean) => {
      const walletType: WalletType = useLedger ? 'ledger' : 'keystore'
      onChangeAsset({ asset, assetWalletType: walletType, runeWalletType })
      resetEnteredAmounts()
    },
    [asset, onChangeAsset, resetEnteredAmounts, runeWalletType]
  )

  const renderPasswordConfirmationModal = useMemo(() => {
    if (showPasswordModal === 'none') return <></>

    const onSuccess = () => {
      if (showPasswordModal === 'deposit') submitDepositTx()
      if (showPasswordModal === 'approve') submitApproveTx()
      setShowPasswordModal('none')
    }
    const onClose = () => {
      setShowPasswordModal('none')
    }

    return (
      <WalletPasswordConfirmationModal onSuccess={onSuccess} onClose={onClose} validatePassword$={validatePassword$} />
    )
  }, [showPasswordModal, submitApproveTx, submitDepositTx, validatePassword$])

  const renderLedgerConfirmationModal = useMemo(() => {
    if (showLedgerModal === 'none') return <></>

    const onClose = () => {
      setShowLedgerModal('none')
    }

    const onSucceess = () => {
      if (showLedgerModal === 'deposit') setShowPasswordModal('deposit')
      if (showLedgerModal === 'approve') submitApproveTx()
      setShowLedgerModal('none')
    }

    const chainAsString = chainToString(chain)
    const txtNeedsConnected = intl.formatMessage(
      {
        id: 'ledger.needsconnected'
      },
      { chain: chainAsString }
    )

    const description1 =
      // extra info for ERC20 assets only
      isEthChain(chain) && !isEthAsset(asset)
        ? `${txtNeedsConnected} ${intl.formatMessage(
            {
              id: 'ledger.blindsign'
            },
            { chain: chainAsString }
          )}`
        : txtNeedsConnected

    const description2 = intl.formatMessage({ id: 'ledger.sign' })

    const oIsDeposit = O.fromPredicate<ModalState>((v) => v === 'deposit')(showLedgerModal)

    const addresses = FP.pipe(
      sequenceTOption(oIsDeposit, oDepositParams),
      O.chain(([_, { poolAddress, runeSender, assetSender }]) => {
        const recipient = poolAddress.address
        if (isRuneLedger) return O.some({ recipient, sender: runeSender })
        if (isAssetLedger) return O.some({ recipient, sender: assetSender })
        return O.none
      })
    )

    return (
      <LedgerConfirmationModal
        onSuccess={onSucceess}
        onClose={onClose}
        visible
        chain={isRuneLedger ? THORChain : chain}
        network={network}
        description1={description1}
        description2={description2}
        addresses={addresses}
      />
    )
  }, [asset, chain, intl, isAssetLedger, isRuneLedger, network, oDepositParams, showLedgerModal, submitApproveTx])

  useEffect(() => {
    if (!eqOAsset.equals(prevAsset.current, O.some(asset))) {
      prevAsset.current = O.some(asset)
      // reset deposit state
      resetDepositState()
      // set values to zero
      changePercentHandler(0)
      // reset isApproved state
      resetIsApprovedState()
      // reset approve state
      resetApproveState()
      // reset fees
      prevDepositFees.current = O.none
      // reload fees
      reloadFeesHandler()
    }
  }, [
    asset,
    reloadShares,
    reloadFeesHandler,
    resetApproveState,
    resetIsApprovedState,
    reloadSelectedPoolDetail,
    resetDepositState,
    changePercentHandler,
    minRuneAmountToDeposit
  ])

  /**
   * Disables form elements (input fields, slider)
   */
  const disabledForm = useMemo(
    () =>
      disableDepositAction ||
      isBalanceError ||
      protocolLimitReached ||
      disabled ||
      assetBalance.amount().isZero() ||
      runeBalance.amount().isZero() ||
      hasPendingAssets ||
      hasAsymDeposits ||
      hasAssetMismatch,
    [
      disableDepositAction,
      isBalanceError,
      protocolLimitReached,
      disabled,
      assetBalance,
      runeBalance,
      hasPendingAssets,
      hasAsymDeposits,
      hasAssetMismatch
    ]
  )

  /**
   * Disables submit button
   */
  const disableSubmit = useMemo(
    () =>
      disabledForm ||
      RD.isPending(depositFeesRD) ||
      RD.isPending(approveState) ||
      walletBalancesLoading ||
      isThorchainFeeError ||
      isAssetChainFeeError ||
      isZeroAmountToDeposit ||
      minRuneAmountError ||
      minAssetAmountError,
    [
      approveState,
      depositFeesRD,
      disabledForm,
      isAssetChainFeeError,
      isThorchainFeeError,
      isZeroAmountToDeposit,
      minAssetAmountError,
      minRuneAmountError,
      walletBalancesLoading
    ]
  )

  const disableSubmitApprove = useMemo(
    () => checkIsApprovedError || isApproveFeeError || walletBalancesLoading,

    [checkIsApprovedError, isApproveFeeError, walletBalancesLoading]
  )

  const renderMinAmount = useCallback(
    ({
      minAmount,
      minAmountInfo,
      asset,
      isError
    }: {
      minAmount: BaseAmount
      minAmountInfo: string
      asset: Asset
      isError: boolean
    }) => (
      <div className="flex w-full items-center pl-10px pt-5px">
        <p
          className={`m-0 pr-5px font-main text-[12px] uppercase ${
            isError ? 'dark:error-0d text-error0' : 'text-gray2 dark:text-gray2d'
          }`}>
          {`${intl.formatMessage({ id: 'common.min' })}: ${formatAssetAmountCurrency({
            asset,
            amount: baseToAsset(minAmount),
            trimZeros: true
          })}`}
        </p>
        <InfoIcon
          // override color
          className={`${isError ? '' : 'text-gray2 dark:text-gray2d'}`}
          color={isError ? 'error' : 'neutral'}
          tooltip={minAmountInfo}
        />
      </div>
    ),
    [intl]
  )

  const extraRuneContent = useMemo(
    () => (
      <div className="flex flex-col">
        <MaxBalanceButton
          className="ml-10px mt-5px"
          classNameButton="!text-gray2 dark:!text-gray2d"
          classNameIcon={
            // show warn icon if maxAmountToSwapMax <= 0
            maxRuneAmountToDeposit.gt(ZERO_BASE_AMOUNT)
              ? `text-gray2 dark:text-gray2d`
              : 'text-warning0 dark:text-warning0d'
          }
          size="medium"
          balance={{ amount: maxRuneAmountToDeposit, asset: AssetRuneNative }}
          onClick={() => {
            updateRuneAmount(maxRuneAmountToDeposit)
          }}
          maxInfoText={intl.formatMessage(
            { id: 'deposit.add.max.infoWithFee' },
            { balance: runeBalanceLabel, fee: runeFeeLabel }
          )}
          hidePrivateData={hidePrivateData}
        />
        {minRuneAmountError &&
          renderMinAmount({
            minAmount: minRuneAmountToDeposit,
            minAmountInfo: intl.formatMessage({ id: 'deposit.add.min.info' }),
            asset,
            isError: minRuneAmountError
          })}
      </div>
    ),
    [
      asset,
      hidePrivateData,
      intl,
      maxRuneAmountToDeposit,
      minRuneAmountError,
      minRuneAmountToDeposit,
      renderMinAmount,
      runeBalanceLabel,
      runeFeeLabel,
      updateRuneAmount
    ]
  )

  const extraAssetContent = useMemo(
    () => (
      <div className="flex flex-col">
        <MaxBalanceButton
          className="ml-10px mt-5px"
          classNameButton="!text-gray2 dark:!text-gray2d"
          classNameIcon={
            // show warn icon if maxAmountToSwapMax <= 0
            maxAssetAmountToDepositMax1e8.gt(baseAmount(0, maxAssetAmountToDepositMax1e8.decimal))
              ? `text-gray2 dark:text-gray2d`
              : 'text-warning0 dark:text-warning0d'
          }
          size="medium"
          balance={{ amount: maxAssetAmountToDepositMax1e8, asset }}
          onClick={() => {
            updateAssetAmount(maxAssetAmountToDepositMax1e8)
          }}
          maxInfoText={
            isChainAsset(asset)
              ? intl.formatMessage(
                  { id: 'deposit.add.max.infoWithFee' },
                  { balance: assetBalanceLabel, fee: assetFeeLabel }
                )
              : intl.formatMessage({ id: 'deposit.add.max.info' }, { balance: assetBalanceLabel })
          }
          hidePrivateData={hidePrivateData}
        />
        {minAssetAmountError &&
          renderMinAmount({
            minAmount: minAssetAmountToDepositMax1e8,
            minAmountInfo: intl.formatMessage({ id: 'deposit.add.min.info' }),
            asset,
            isError: minAssetAmountError
          })}
      </div>
    ),
    [
      maxAssetAmountToDepositMax1e8,
      asset,
      intl,
      assetBalanceLabel,
      assetFeeLabel,
      hidePrivateData,
      minAssetAmountError,
      renderMinAmount,
      minAssetAmountToDepositMax1e8,
      updateAssetAmount
    ]
  )

  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-between">
      {hasPendingAssets && <div className="w-full pb-20px xl:px-20px">{renderPendingAssets}</div>}
      {hasAsymDeposits && <div className="w-full pb-20px xl:px-20px">{renderAsymDepositWarning}</div>}
      {hasAssetMismatch && <div className="w-full pb-20px xl:px-20px">{renderAssetMismatch}</div>}
      {showBalanceError && <div className="w-full pb-20px xl:px-20px">{renderBalanceError}</div>}

      <div className="flex max-w-[500px] flex-col">
        <AssetInput
          className="w-full"
          title={intl.formatMessage({ id: 'deposit.add.runeSide' })}
          amount={{ amount: runeAmountToDeposit, asset: AssetRuneNative }}
          priceAmount={priceRuneAmountToDepositMax1e8}
          assets={[]}
          network={network}
          onChangeAsset={FP.constVoid}
          onChange={runeAmountChangeHandler}
          onBlur={inputOnBlur}
          onFocus={() => setSelectedInput('rune')}
          showError={minRuneAmountError}
          useLedger={isRuneLedger}
          hasLedger={hasRuneLedger}
          useLedgerHandler={useRuneLedgerHandler}
          extraContent={extraRuneContent}
        />

        <div className="w-full px-20px pt-20px pb-40px">
          <Slider
            onAfterChange={onAfterSliderChangeHandler}
            disabled={disabledForm}
            value={percentValueToDeposit}
            onChange={changePercentHandler}
            tooltipPlacement="top"
            withLabel={true}
          />
        </div>

        <AssetInput
          className="w-full"
          title={intl.formatMessage({ id: 'deposit.add.assetSide' })}
          amount={{ amount: assetAmountToDepositMax1e8, asset }}
          priceAmount={priceAssetAmountToDepositMax1e8}
          assets={poolBasedBalancesAssets}
          network={network}
          onChangeAsset={onChangeAssetHandler}
          onChange={assetAmountChangeHandler}
          onBlur={inputOnBlur}
          onFocus={() => setSelectedInput('asset')}
          showError={minAssetAmountError}
          useLedger={isAssetLedger}
          hasLedger={hasAssetLedger}
          useLedgerHandler={useAssetLedgerHandler}
          extraContent={extraAssetContent}
        />

        <div className="flex flex-col items-center justify-between py-30px">
          {renderIsApprovedError}
          {(walletBalancesLoading || checkIsApproved) && (
            <LoadingView
              className="mb-20px"
              label={
                // We show only one loading state at time
                // Order matters: Show states with shortest loading time before others
                // (approve state takes just a short time to load, but needs to be displayed)
                checkIsApproved
                  ? intl.formatMessage({ id: 'common.approve.checking' }, { asset: asset.ticker })
                  : walletBalancesLoading
                  ? intl.formatMessage({ id: 'common.balance.loading' })
                  : undefined
              }
            />
          )}
          {isApproved ? (
            <>
              {renderAssetChainFeeError}
              {renderThorchainFeeError}
              <FlatButton className="mb-20px min-w-[200px]" size="large" onClick={onSubmit} disabled={disableSubmit}>
                {intl.formatMessage({ id: 'common.add' })}
              </FlatButton>
            </>
          ) : (
            <>
              {renderApproveFeeError}
              {renderApproveError}
              <FlatButton
                className="mb-20px min-w-[200px]"
                size="large"
                color="warning"
                disabled={disableSubmitApprove}
                onClick={onApprove}
                loading={RD.isPending(approveState)}>
                {intl.formatMessage({ id: 'common.approve' })}
              </FlatButton>

              {!RD.isInitial(uiApproveFeesRD) && <Fees fees={uiApproveFeesRD} reloadFees={reloadApproveFeesHandler} />}
            </>
          )}
        </div>

        <div className={`w-full px-10px font-main text-[12px] uppercase dark:border-gray1d`}>
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
            {/* fees */}
            <div className="flex w-full items-center justify-between font-mainBold">
              <BaseButton
                disabled={RD.isPending(depositFeesRD) || RD.isInitial(depositFeesRD)}
                className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                onClick={reloadFeesHandler}>
                {intl.formatMessage({ id: 'common.fees.estimated' })}
                <ArrowPathIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
              </BaseButton>
              <div>{priceDepositFeesLabel}</div>
            </div>

            {showDetails && (
              <>
                <div className="flex w-full justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.fee.inbound.rune' })}</div>
                  <div>{priceRuneInFeeLabel}</div>
                </div>
                <div className="flex w-full justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.fee.outbound.rune' })}</div>
                  <div>{priceRuneOutFeeLabel}</div>
                </div>
                <div className="flex w-full justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.fee.inbound.asset' })}</div>
                  <div>{priceAssetInFeeLabel}</div>
                </div>
                <div className="flex w-full justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.fee.outbound.asset' })}</div>
                  <div>{priceAssetOutFeeLabel}</div>
                </div>
                <div className="flex w-full justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.fee.affiliate' })}</div>
                  <div>
                    {formatAssetAmountCurrency({
                      amount: ZERO_ASSET_AMOUNT,
                      asset: pricePool.asset,
                      decimal: 0
                    })}
                  </div>
                </div>
              </>
            )}

            {/* addresses */}
            {showDetails && (
              <>
                <div className={`w-full pt-10px font-mainBold text-[14px]`}>
                  {intl.formatMessage({ id: 'common.addresses' })}
                </div>
                {/* rune sender address */}
                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.rune' })}</div>
                  <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                    {FP.pipe(
                      oRuneWB,
                      O.map(({ walletAddress: address }) => (
                        <TooltipAddress title={address} key="tooltip-asset-sender-addr">
                          {hidePrivateData ? hiddenString : address}
                        </TooltipAddress>
                      )),
                      O.getOrElse(() => <>{noDataString}</>)
                    )}
                  </div>
                </div>
                {/* asset sender address */}
                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.asset' })}</div>
                  <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                    {FP.pipe(
                      oAssetWB,
                      O.map(({ walletAddress: address }) => (
                        <TooltipAddress title={address} key="tooltip-asset-sender-addr">
                          {hidePrivateData ? hiddenString : address}
                        </TooltipAddress>
                      )),
                      O.getOrElse(() => <>{noDataString}</>)
                    )}
                  </div>
                </div>
                {/* asset inbound address */}
                {FP.pipe(
                  oDepositParams,
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

            {/* balances */}
            {showDetails && (
              <>
                <div className={`w-full pt-10px text-[14px]`}>
                  <BaseButton
                    disabled={walletBalancesLoading}
                    className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                    onClick={reloadBalances}>
                    {intl.formatMessage({ id: 'common.balances' })}
                    <ArrowPathIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
                  </BaseButton>
                </div>
                {/* rune sender balance */}
                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.rune' })}</div>
                  <div className="truncate pl-20px text-[13px] normal-case leading-normal">{runeBalanceLabel}</div>
                </div>
                {/* asset sender balance */}
                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div>{intl.formatMessage({ id: 'common.asset' })}</div>
                  <div className="truncate pl-20px text-[13px] normal-case leading-normal">{assetBalanceLabel}</div>
                </div>
              </>
            )}

            {/* memo */}
            {showDetails && (
              <>
                <div className={`w-full pt-10px font-mainBold text-[14px]`}>
                  {intl.formatMessage({ id: 'common.memos' })}
                </div>
                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div className="">
                    {FP.pipe(
                      oDepositParams,
                      O.map(({ memos: { rune: memo } }) => memo),
                      O.getOrElse(() => emptyString),
                      (memo) => (
                        <CopyLabel
                          className="whitespace-nowrap pl-0 uppercase text-gray2 dark:text-gray2d"
                          label={intl.formatMessage({ id: 'common.transaction.short.rune' })}
                          key="memo-copy"
                          textToCopy={memo}
                        />
                      )
                    )}
                  </div>

                  <div className="truncate pl-10px font-main text-[12px]">
                    {FP.pipe(
                      oDepositParams,
                      O.map(({ memos: { rune: memo } }) => (
                        <Tooltip title={memo} key="tooltip-rune-memo">
                          {hidePrivateData ? hiddenString : memo}
                        </Tooltip>
                      )),
                      O.toNullable
                    )}
                  </div>
                </div>

                <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                  <div className="">
                    {FP.pipe(
                      oDepositParams,
                      O.map(({ memos: { asset: memo } }) => memo),
                      O.getOrElse(() => emptyString),
                      (memo) => (
                        <CopyLabel
                          className="whitespace-nowrap pl-0 uppercase text-gray2 dark:text-gray2d"
                          label={intl.formatMessage({ id: 'common.transaction.short.asset' })}
                          key="memo-copy"
                          textToCopy={memo}
                        />
                      )
                    )}
                  </div>

                  <div className="truncate pl-10px font-main text-[12px]">
                    {FP.pipe(
                      oDepositParams,
                      O.map(({ memos: { asset: memo } }) => (
                        <Tooltip title={memo} key="tooltip-asset-memo">
                          {hidePrivateData ? hiddenString : memo}
                        </Tooltip>
                      )),
                      O.toNullable
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {renderPasswordConfirmationModal}
        {renderLedgerConfirmationModal}
        {renderTxModal}
      </div>
    </div>
  )
}
