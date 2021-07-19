import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, AssetRuneNative, bnOrZero, Chain, THORChain } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { SLIP_TOLERANCE_KEY } from '../../components/currency/CurrencyInfo'
import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { Button, RefreshButton } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { eqChain } from '../../helpers/fp/eq'
import { sequenceTOption, sequenceTRD } from '../../helpers/fpHelpers'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { SwapRouteParams } from '../../routes/pools/swap'
import * as walletRoutes from '../../routes/wallet'
import { AssetWithDecimalLD, AssetWithDecimalRD } from '../../services/chain/types'
import { OpenExplorerTxUrl } from '../../services/clients'
import { DEFAULT_NETWORK, DEFAULT_SLIP_TOLERANCE } from '../../services/const'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import { isSlipTolerance, SlipTolerance } from '../../types/asgardex'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()
  const history = useHistory()

  const { network$, slipTolerance$, changeSlipTolerance } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, reloadPools, selectedPoolAddress$, reloadInboundAddresses, haltedChains$ },
    setSelectedPoolAsset
  } = midgardService
  const { reloadSwapFees, swapFees$, addressByChain$, swap$, assetWithDecimal$ } = useChainContext()

  const {
    balancesState$,
    reloadBalancesByChain,
    keystoreService: { keystore$, validatePassword$ }
  } = useWalletContext()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])

  const { reloadApproveFee, approveFee$, approveERC20Token$, isApprovedERC20Token$ } = useEthereumContext()

  const keystore = useObservableState(keystore$, O.none)

  const poolsState = useObservableState(poolsState$, RD.initial)

  const oRouteSource = useMemo(() => O.fromNullable(assetFromString(source.toUpperCase())), [source])
  const oRouteTarget = useMemo(() => O.fromNullable(assetFromString(target.toUpperCase())), [target])

  useEffect(() => {
    // Source asset is the asset of the pool we need to interact with
    // Store it in global state, all depending streams will be updated then
    setSelectedPoolAsset(oRouteSource)

    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oRouteSource, setSelectedPoolAsset])

  // reload inbound addresses at `onMount` to get always latest `pool address` + `feeRates`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const sourceAssetDecimal$: AssetWithDecimalLD = useMemo(
    () =>
      FP.pipe(
        oRouteSource,
        O.fold(
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'swap.errors.asset.missingSourceAsset' })))),
          (asset) => assetWithDecimal$(asset, network)
        )
      ),
    [assetWithDecimal$, intl, network, oRouteSource]
  )

  const sourceAssetRD: AssetWithDecimalRD = useObservableState(sourceAssetDecimal$, RD.initial)

  const targetAssetDecimal$: AssetWithDecimalLD = useMemo(
    () =>
      FP.pipe(
        oRouteTarget,
        O.fold(
          () => Rx.of(RD.failure(Error(intl.formatMessage({ id: 'swap.errors.asset.missingTargetAsset' })))),
          (asset) => assetWithDecimal$(asset, network)
        )
      ),
    [assetWithDecimal$, intl, network, oRouteTarget]
  )

  const targetAssetRD: AssetWithDecimalRD = useObservableState(targetAssetDecimal$, RD.initial)

  const balancesState = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const selectedPoolAddress = useObservableState(selectedPoolAddress$, O.none)

  const address$ = useMemo(
    () =>
      FP.pipe(
        oRouteTarget,
        O.fold(
          () => Rx.EMPTY,
          ({ chain }) => addressByChain$(chain)
        )
      ),

    [addressByChain$, oRouteTarget]
  )
  const targetWalletAddress = useObservableState(address$, O.none)

  const openExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(THORChain)

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
      sequenceTOption(oRouteSource, oRouteTarget),
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
  }, [oRouteSource, oRouteTarget, reloadBalancesByChain])

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
        const itemAsInt = parseInt(s)
        const slipTolerance = isSlipTolerance(itemAsInt) ? itemAsInt : DEFAULT_SLIP_TOLERANCE
        changeSlipTolerance(slipTolerance)
        return slipTolerance
      }),
      O.getOrElse(() => DEFAULT_SLIP_TOLERANCE)
    )

  const slipTolerance = useObservableState<SlipTolerance>(slipTolerance$, getStoredSlipTolerance())

  const onChangePath = useCallback(
    (path) => {
      history.replace(path)
    },
    [history]
  )

  const importWalletHandler = useCallback(() => {
    history.push(walletRoutes.base.path())
  }, [history])

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
                  keystore={keystore}
                  validatePassword$={validatePassword$}
                  goToTransaction={openExplorerTxUrl}
                  assets={{ inAsset: sourceAsset, outAsset: targetAsset }}
                  poolAddress={selectedPoolAddress}
                  availableAssets={availableAssets}
                  poolsData={poolsData}
                  walletBalances={balancesState}
                  reloadFees={reloadSwapFees}
                  fees$={swapFees$}
                  reloadApproveFee={reloadApproveFee}
                  approveFee$={approveFee$}
                  targetWalletAddress={targetWalletAddress}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangePath={onChangePath}
                  network={network}
                  slipTolerance={slipTolerance}
                  changeSlipTolerance={changeSlipTolerance}
                  approveERC20Token$={approveERC20Token$}
                  isApprovedERC20Token$={isApprovedERC20Token$}
                  importWalletHandler={importWalletHandler}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
