import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, Asset, AssetRuneNative, assetToString, bn, Chain, THORChain } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { isLedgerWallet, isWalletType } from '../../../shared/utils/guard'
import { WalletType } from '../../../shared/wallet/types'
import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { SLIP_TOLERANCE_KEY } from '../../components/swap/SelectableSlipTolerance'
import * as Utils from '../../components/swap/Swap.utils'
import { BackLinkButton } from '../../components/uielements/button'
import { Button, RefreshButton } from '../../components/uielements/button'
import { DEFAULT_WALLET_TYPE } from '../../const'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { assetInList, getAssetFromNullableString } from '../../helpers/assetHelper'
import { eqChain, eqNetwork } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import * as PoolHelpers from '../../helpers/poolHelper'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { addressFromOptionalWalletAddress, getWalletAddressFromNullableString } from '../../helpers/walletHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenAddressUrl } from '../../hooks/useOpenAddressUrl'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../hooks/useValidateAddress'
import { swap } from '../../routes/pools'
import { SwapRouteParams, SwapRouteTargetWalletType } from '../../routes/pools/swap'
import * as walletRoutes from '../../routes/wallet'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { DEFAULT_SLIP_TOLERANCE } from '../../services/const'
import { INITIAL_BALANCES_STATE, DEFAULT_BALANCES_FILTER } from '../../services/wallet/const'
import { ledgerAddressToWalletAddress } from '../../services/wallet/util'
import { isSlipTolerance, SlipTolerance } from '../../types/asgardex'

type UpdateLedgerAddress = { chain: Chain; network: Network }

const eqUpdateLedgerAddress = Eq.struct<UpdateLedgerAddress>({
  chain: eqChain,
  network: eqNetwork
})

type Props = {
  sourceAsset: Asset
  targetAsset: Asset
  sourceWalletType: WalletType
  targetWalletType: O.Option<WalletType>
  recipientAddress: O.Option<Address>
}

const SuccessRouteView: React.FC<Props> = ({
  sourceAsset,
  targetAsset,
  sourceWalletType,
  targetWalletType: oTargetWalletType,
  recipientAddress: oRecipientAddress
}): JSX.Element => {
  const { chain: sourceChain } = sourceAsset
  const { chain: targetChain } = targetAsset

  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const { slipTolerance$, changeSlipTolerance } = useAppContext()

  const { network } = useNetwork()

  const { reloadInboundAddresses } = useThorchainContext()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, reloadPools, selectedPoolAddress$, selectedPricePool$, haltedChains$ },
    setSelectedPoolAsset
  } = midgardService

  const pricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const { reloadSwapFees, swapFees$, addressByChain$, swap$, assetWithDecimal$ } = useChainContext()

  const {
    balancesState$,
    reloadBalancesByChain,
    getLedgerAddress$,
    keystoreService: { keystoreState$, validatePassword$ }
  } = useWalletContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])
  const { mimirHalt } = useMimirHalt()

  const { reloadApproveFee, approveFee$, approveERC20Token$, isApprovedERC20Token$ } = useEthereumContext()

  const keystore = useObservableState(keystoreState$, O.none)

  const poolsState = useObservableState(poolsState$, RD.initial)

  useEffect(() => {
    // Source asset is the asset of the pool we need to interact with
    // Store it in global state, all depending streams will be updated then
    setSelectedPoolAsset(O.some(sourceAsset))

    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [sourceAsset, setSelectedPoolAsset])

  // reload inbound addresses at `onMount` to get always latest `pool address` + `feeRates`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const sourceAssetDecimal$: AssetWithDecimalLD = useMemo(
    () => assetWithDecimal$(sourceAsset, network),
    [assetWithDecimal$, network, sourceAsset]
  )

  const sourceAssetRD: AssetWithDecimalRD = useObservableState(sourceAssetDecimal$, RD.initial)

  const targetAssetDecimal$: AssetWithDecimalLD = useMemo(
    () => assetWithDecimal$(targetAsset, network),
    [assetWithDecimal$, network, targetAsset]
  )

  const targetAssetRD: AssetWithDecimalRD = useObservableState(targetAssetDecimal$, RD.initial)

  const [balancesState] = useObservableState(
    () =>
      balancesState$({
        ...DEFAULT_BALANCES_FILTER,
        [Chain.Bitcoin]: 'confirmed'
      }),
    INITIAL_BALANCES_STATE
  )

  const selectedPoolAddress = useObservableState(selectedPoolAddress$, O.none)

  const [oSourceKeystoreAddress, updateSourceKeystoreAddress$] = useObservableState<O.Option<Address>, Chain>(
    (sourceChain$) =>
      FP.pipe(
        sourceChain$,
        RxOp.distinctUntilChanged(eqChain.equals),
        RxOp.switchMap(addressByChain$),
        RxOp.map(addressFromOptionalWalletAddress)
      ),
    O.none
  )

  useEffect(() => {
    updateSourceKeystoreAddress$(sourceChain)
  }, [sourceChain, updateSourceKeystoreAddress$])

  const [oTargetKeystoreAddress, updateTargetKeystoreAddress$] = useObservableState<O.Option<Address>, Chain>(
    (targetChain$) =>
      FP.pipe(
        targetChain$,
        RxOp.distinctUntilChanged(eqChain.equals),
        RxOp.switchMap(addressByChain$),
        RxOp.map(addressFromOptionalWalletAddress)
      ),
    O.none
  )

  useEffect(() => {
    updateTargetKeystoreAddress$(targetChain)
  }, [targetChain, updateTargetKeystoreAddress$])

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(O.some(THORChain))

  const renderError = useCallback(
    (e: Error) => (
      <ErrorView
        title={intl.formatMessage({ id: 'common.error' })}
        subTitle={e?.message ?? e.toString()}
        extra={<Button onClick={reloadPools}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
      />
    ),
    [intl, reloadPools]
  )

  const reloadBalances = useCallback(() => {
    if (eqChain.equals(sourceChain, targetChain)) {
      reloadBalancesByChain(sourceChain)()
    } else {
      reloadBalancesByChain(sourceChain)()
      reloadBalancesByChain(targetChain)()
    }
  }, [sourceChain, targetChain, reloadBalancesByChain])

  useEffect(() => {
    // reload balances, whenever sourceAsset and targetAsset have been changed (both are properties of `reloadBalances` )
    reloadBalances()
  }, [reloadBalances])

  const reloadHandler = useCallback(() => {
    reloadBalances()
    reloadPools()
    reloadInboundAddresses()
  }, [reloadBalances, reloadInboundAddresses, reloadPools])

  const getStoredSlipTolerance = (): SlipTolerance =>
    FP.pipe(
      localStorage.getItem(SLIP_TOLERANCE_KEY),
      O.fromNullable,
      O.map((s) => {
        const itemAsNumber = Number(s)
        const slipTolerance = isSlipTolerance(itemAsNumber) ? itemAsNumber : DEFAULT_SLIP_TOLERANCE
        changeSlipTolerance(slipTolerance)
        return slipTolerance
      }),
      O.getOrElse(() => DEFAULT_SLIP_TOLERANCE)
    )

  const slipTolerance = useObservableState<SlipTolerance>(slipTolerance$, getStoredSlipTolerance())

  const onChangeAssetHandler = useCallback(
    ({
      source,
      sourceWalletType,
      target,
      targetWalletType: oTargetWalletType,
      recipientAddress: oRecipientAddress
    }: {
      source: Asset
      target: Asset
      sourceWalletType: WalletType
      targetWalletType: O.Option<WalletType>
      recipientAddress: O.Option<Address>
    }) => {
      const targetWalletType = FP.pipe(
        oTargetWalletType,
        O.getOrElse<SwapRouteTargetWalletType>(() => 'custom')
      )
      const recipient = FP.pipe(oRecipientAddress, O.toUndefined)
      const path = swap.path({
        source: assetToString(source),
        sourceWalletType,
        target: assetToString(target),
        targetWalletType,
        recipient
      })
      navigate(path, { replace: true })
    },
    [navigate]
  )

  const importWalletHandler = useCallback(() => {
    navigate(walletRoutes.base.path(location.pathname))
  }, [location.pathname, navigate])

  const targetAssetChain = useMemo(
    () =>
      FP.pipe(
        targetAssetRD,
        RD.map(({ asset }) => asset.chain),
        RD.getOrElse(() => THORChain)
      ),
    [targetAssetRD]
  )

  const [oTargetLedgerAddress, updateTargetLedgerAddress$] = useObservableState<O.Option<Address>, UpdateLedgerAddress>(
    (targetLedgerAddressChain$) =>
      FP.pipe(
        targetLedgerAddressChain$,
        RxOp.distinctUntilChanged(eqUpdateLedgerAddress.equals),
        RxOp.switchMap(({ chain }) => getLedgerAddress$(chain)),
        RxOp.map(O.map(ledgerAddressToWalletAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),
    O.none
  )

  useEffect(() => {
    updateTargetLedgerAddress$({ chain: targetChain, network })
  }, [network, targetChain, updateTargetLedgerAddress$])

  const [oSourceLedgerAddress, updateSourceLedgerAddress$] = useObservableState<O.Option<Address>, UpdateLedgerAddress>(
    (sourceLedgerAddressChain$) =>
      FP.pipe(
        sourceLedgerAddressChain$,
        RxOp.distinctUntilChanged(eqUpdateLedgerAddress.equals),
        RxOp.switchMap(({ chain }) => getLedgerAddress$(chain)),
        RxOp.map(O.map(ledgerAddressToWalletAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),
    O.none
  )

  useEffect(() => {
    updateSourceLedgerAddress$({ chain: sourceChain, network })
  }, [network, sourceChain, updateSourceLedgerAddress$])

  const isTargetLedger = FP.pipe(
    oTargetWalletType,
    O.map(isLedgerWallet),
    O.getOrElse(() => false)
  )

  const oRecipient: O.Option<Address> = FP.pipe(
    oRecipientAddress,
    O.fromPredicate(O.isSome),
    O.flatten,
    O.alt(() => (isTargetLedger ? oTargetLedgerAddress : oTargetKeystoreAddress))
  )

  const { validateSwapAddress } = useValidateAddress(targetAssetChain)
  const openAddressUrl = useOpenAddressUrl(targetAssetChain)

  return (
    <>
      <div className="relative mb-20px flex items-center justify-between">
        <BackLinkButton className="absolute !m-0" />
        <h2 className="m-0 w-full text-center font-mainSemiBold text-16 uppercase text-turquoise">
          {intl.formatMessage({ id: 'common.swap' })}
        </h2>
        <RefreshButton className="absolute right-0" clickHandler={reloadHandler} />
      </div>

      <div className="flex justify-center bg-bg0 dark:bg-bg0d">
        {FP.pipe(
          sequenceTRD(poolsState, sourceAssetRD, targetAssetRD),
          RD.fold(
            () => <></>,
            () => (
              <div className="flex min-h-[600px] w-full items-center justify-center">
                <Spin size="large" />
              </div>
            ),
            renderError,
            ([{ assetDetails, poolsData, poolDetails }, sourceAsset, targetAsset]) => {
              const hasRuneAsset = FP.pipe(
                assetDetails,
                A.map(({ asset }) => asset),
                assetInList(AssetRuneNative)
              )
              if (!hasRuneAsset) {
                assetDetails = [{ asset: AssetRuneNative, assetPrice: bn(1) }, ...assetDetails]
              }

              const sourceAssetDetail = FP.pipe(Utils.pickPoolAsset(assetDetails, sourceAsset.asset), O.toNullable)
              // Make sure sourceAsset is available in pools
              if (!sourceAssetDetail)
                return renderError(Error(`Missing pool for source asset ${assetToString(sourceAsset.asset)}`))
              const targetAssetDetail = FP.pipe(Utils.pickPoolAsset(assetDetails, targetAsset.asset), O.toNullable)
              // Make sure targetAsset is available in pools
              if (!targetAssetDetail)
                return renderError(Error(`Missing pool for target asset ${assetToString(targetAsset.asset)}`))

              const poolAssets: Asset[] = FP.pipe(
                assetDetails,
                A.map(({ asset }) => asset)
              )

              const disableAllPoolActions = (chain: Chain) =>
                PoolHelpers.disableAllActions({ chain, haltedChains, mimirHalt })

              const disableTradingPoolActions = (chain: Chain) =>
                PoolHelpers.disableTradingActions({ chain, haltedChains, mimirHalt })

              const checkDisableSwapAction = () => {
                const sourceChain = sourceAsset.asset.chain
                const targetChain = targetAsset.asset.chain
                return (
                  disableAllPoolActions(sourceChain) ||
                  disableTradingPoolActions(sourceChain) ||
                  disableAllPoolActions(targetChain) ||
                  disableTradingPoolActions(targetChain)
                )
              }

              return (
                <Swap
                  disableSwapAction={checkDisableSwapAction()}
                  keystore={keystore}
                  validatePassword$={validatePassword$}
                  goToTransaction={openExplorerTxUrl}
                  getExplorerTxUrl={getExplorerTxUrl}
                  assets={{
                    source: { ...sourceAsset, price: sourceAssetDetail.assetPrice },
                    target: { ...targetAsset, price: targetAssetDetail.assetPrice }
                  }}
                  sourceKeystoreAddress={oSourceKeystoreAddress}
                  sourceLedgerAddress={oSourceLedgerAddress}
                  sourceWalletType={sourceWalletType}
                  targetWalletType={oTargetWalletType}
                  poolAddress={selectedPoolAddress}
                  poolAssets={poolAssets}
                  poolsData={poolsData}
                  pricePool={pricePool}
                  poolDetails={poolDetails}
                  walletBalances={balancesState}
                  reloadFees={reloadSwapFees}
                  fees$={swapFees$}
                  reloadApproveFee={reloadApproveFee}
                  approveFee$={approveFee$}
                  targetKeystoreAddress={oTargetKeystoreAddress}
                  targetLedgerAddress={oTargetLedgerAddress}
                  recipientAddress={oRecipient}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangeAsset={onChangeAssetHandler}
                  network={network}
                  slipTolerance={slipTolerance}
                  changeSlipTolerance={changeSlipTolerance}
                  approveERC20Token$={approveERC20Token$}
                  isApprovedERC20Token$={isApprovedERC20Token$}
                  importWalletHandler={importWalletHandler}
                  clickAddressLinkHandler={openAddressUrl}
                  addressValidator={validateSwapAddress}
                  // TODO (@veado) Handle private data
                  hidePrivateData={false}
                />
              )
            }
          )
        )}
      </div>
    </>
  )
}

export const SwapView: React.FC = (): JSX.Element => {
  const {
    source,
    target,
    sourceWalletType: routeSourceWalletType,
    targetWalletType: routeTargetWalletType,
    recipient
  } = useParams<SwapRouteParams>()
  const oSourceAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(source), [source])
  const oTargetAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(target), [target])
  const oRecipientAddress: O.Option<Address> = useMemo(() => getWalletAddressFromNullableString(recipient), [recipient])
  const sourceWalletType = routeSourceWalletType || DEFAULT_WALLET_TYPE
  const oTargetWalletType = FP.pipe(routeTargetWalletType, O.fromPredicate(isWalletType))

  const intl = useIntl()

  return FP.pipe(
    sequenceTOption(oSourceAsset, oTargetAsset),
    O.fold(
      () => (
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `source: ${source}, target: ${target}`
            }
          )}
        />
      ),
      ([sourceAsset, targetAsset]) => (
        <SuccessRouteView
          sourceAsset={sourceAsset}
          targetAsset={targetAsset}
          sourceWalletType={sourceWalletType}
          targetWalletType={oTargetWalletType}
          recipientAddress={oRecipientAddress}
        />
      )
    )
  )
}
