import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, bnOrZero, Chain, THORChain } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { SLIP_TOLERANCE_KEY } from '../../components/currency/CurrencyInfo'
import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { Button, RefreshButton } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getAssetFromNullableString, isRuneNativeAsset } from '../../helpers/assetHelper'
import { eqChain } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { addressFromOptionalWalletAddress } from '../../helpers/walletHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenAddressUrl } from '../../hooks/useOpenAddressUrl'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../hooks/useValidateAddress'
import { SwapRouteParams } from '../../routes/pools/swap'
import * as walletRoutes from '../../routes/wallet'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { DEFAULT_SLIP_TOLERANCE } from '../../services/const'
import { INITIAL_BALANCES_STATE, DEFAULT_BALANCES_FILTER } from '../../services/wallet/const'
import { isSlipTolerance, SlipTolerance } from '../../types/asgardex'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const { slipTolerance$, changeSlipTolerance } = useAppContext()

  const { network } = useNetwork()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, reloadPools, selectedPoolAddress$, reloadInboundAddresses, haltedChains$ },
    setSelectedPoolAsset
  } = midgardService
  const { reloadSwapFees, swapFees$, addressByChain$, swap$, assetWithDecimal$ } = useChainContext()

  const {
    balancesState$,
    reloadBalancesByChain,
    getLedgerAddress$,
    keystoreService: { keystore$, validatePassword$ }
  } = useWalletContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])
  const { mimirHalt } = useMimirHalt()

  const { reloadApproveFee, approveFee$, approveERC20Token$, isApprovedERC20Token$ } = useEthereumContext()

  const keystore = useObservableState(keystore$, O.none)

  const poolsState = useObservableState(poolsState$, RD.initial)

  const oSourceAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(source), [source])
  const oTargetAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(target), [target])

  useEffect(() => {
    // Source asset is the asset of the pool we need to interact with
    // Store it in global state, all depending streams will be updated then
    setSelectedPoolAsset(oSourceAsset)

    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oSourceAsset, setSelectedPoolAsset])

  // reload inbound addresses at `onMount` to get always latest `pool address` + `feeRates`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const sourceAssetDecimal$: AssetWithDecimalLD = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.fold(
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'swap.errors.asset.missingSourceAsset' })))),
          (asset) => assetWithDecimal$(asset, network)
        )
      ),
    [assetWithDecimal$, intl, network, oSourceAsset]
  )

  const sourceAssetRD: AssetWithDecimalRD = useObservableState(sourceAssetDecimal$, RD.initial)

  const targetAssetDecimal$: AssetWithDecimalLD = useMemo(
    () =>
      FP.pipe(
        oTargetAsset,
        O.fold(
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'swap.errors.asset.missingTargetAsset' })))),
          (asset) => assetWithDecimal$(asset, network)
        )
      ),
    [assetWithDecimal$, intl, network, oTargetAsset]
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

  const sourceKeystoreAddress$ = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => addressByChain$(chain)
        ),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [addressByChain$, oSourceAsset]
  )
  const oSourceKeystoreAddress = useObservableState(sourceKeystoreAddress$, O.none)

  const targetKeystoreAddress$ = useMemo(
    () =>
      FP.pipe(
        oTargetAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => addressByChain$(chain)
        ),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [addressByChain$, oTargetAsset]
  )
  const oTargetKeystoreAddress = useObservableState(targetKeystoreAddress$, O.none)

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
    FP.pipe(
      sequenceTOption(oSourceAsset, oTargetAsset),
      O.map(([{ chain: sourceChain }, { chain: targetChain }]) => {
        if (eqChain.equals(sourceChain, targetChain)) {
          reloadBalancesByChain(sourceChain)()
        } else {
          reloadBalancesByChain(sourceChain)()
          reloadBalancesByChain(targetChain)()
        }
        return true
      })
    )
  }, [oSourceAsset, oTargetAsset, reloadBalancesByChain])

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

  const onChangePath = useCallback(
    (path) => {
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

  const sourceLedgerAddress$ = useMemo(
    () =>
      FP.pipe(
        oSourceAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => getLedgerAddress$(chain, network)
        ),
        RxOp.map((rdAddress) => RD.toOption(rdAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [getLedgerAddress$, network, oSourceAsset]
  )
  const oSourceLedgerAddress = useObservableState(sourceLedgerAddress$, O.none)

  const targetLedgerAddress$ = useMemo(
    () =>
      FP.pipe(
        oTargetAsset,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => getLedgerAddress$(chain, network)
        ),
        RxOp.map((rdAddress) => RD.toOption(rdAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [getLedgerAddress$, network, oTargetAsset]
  )
  const oTargetLedgerAddress = useObservableState(targetLedgerAddress$, O.none)

  const { validateSwapAddress } = useValidateAddress(targetAssetChain)
  const openAddressUrl = useOpenAddressUrl(targetAssetChain)

  return (
    <>
      <Styled.TopControlsContainer>
        <Styled.BackLink />
        <RefreshButton clickHandler={reloadHandler} />
      </Styled.TopControlsContainer>
      <Styled.ContentContainer>
        {FP.pipe(
          sequenceTRD(poolsState, sourceAssetRD, targetAssetRD),
          RD.fold(
            () => <></>,
            () => <Spin size="large" />,
            renderError,
            ([{ assetDetails: availableAssets, poolsData }, sourceAsset, targetAsset]) => {
              const hasRuneAsset = Boolean(availableAssets.find(({ asset }) => isRuneNativeAsset(asset)))

              if (!hasRuneAsset) {
                availableAssets.unshift({ asset: AssetRuneNative, assetPrice: bnOrZero(1) })
              }

              return (
                <Swap
                  haltedChains={haltedChains}
                  mimirHalt={mimirHalt}
                  keystore={keystore}
                  validatePassword$={validatePassword$}
                  goToTransaction={openExplorerTxUrl}
                  getExplorerTxUrl={getExplorerTxUrl}
                  assets={{ inAsset: sourceAsset, outAsset: targetAsset }}
                  sourceWalletAddress={oSourceKeystoreAddress}
                  sourceLedgerAddress={oSourceLedgerAddress}
                  poolAddress={selectedPoolAddress}
                  availableAssets={availableAssets}
                  poolsData={poolsData}
                  walletBalances={balancesState}
                  reloadFees={reloadSwapFees}
                  fees$={swapFees$}
                  reloadApproveFee={reloadApproveFee}
                  approveFee$={approveFee$}
                  targetWalletAddress={oTargetKeystoreAddress}
                  targetLedgerAddress={oTargetLedgerAddress}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangePath={onChangePath}
                  network={network}
                  slipTolerance={slipTolerance}
                  changeSlipTolerance={changeSlipTolerance}
                  approveERC20Token$={approveERC20Token$}
                  isApprovedERC20Token$={isApprovedERC20Token$}
                  importWalletHandler={importWalletHandler}
                  clickAddressLinkHandler={openAddressUrl}
                  addressValidator={validateSwapAddress}
                  isDev={$IS_DEV}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
