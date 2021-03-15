import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, AssetRuneNative, bnOrZero } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { BackLink } from '../../components/uielements/backLink'
import { Button } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { SwapRouteParams } from '../../routes/swap'
import { DEFAULT_NETWORK } from '../../services/const'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()
  const history = useHistory()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, reloadPools, selectedPoolAddress$ },
    setSelectedPoolAsset,
    selectedPoolAsset$
  } = midgardService
  const { reloadSwapFees, swapFees$, getExplorerUrlByAsset$, assetAddress$, swap$ } = useChainContext()

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { keystore$, validatePassword$ }
  } = useWalletContext()

  const { approveERC20Token$, isApprovedERC20Token$ } = useEthereumContext()

  const keystore = useObservableState(keystore$, O.none)

  const poolsState = useObservableState(poolsState$, RD.initial)

  const oSource = useMemo(() => O.fromNullable(assetFromString(source.toUpperCase())), [source])
  const oTarget = useMemo(() => O.fromNullable(assetFromString(target.toUpperCase())), [target])

  useEffect(() => {
    // Source asset is the asset of the pool we need to interact with
    // Store it in global state, all depending streams will be updated then
    setSelectedPoolAsset(oSource)

    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oSource, setSelectedPoolAsset])

  const [selectedPoolAssetRD] = useObservableState(
    () =>
      selectedPoolAsset$.pipe(
        RxOp.map((selectedPoolAsset) =>
          RD.fromOption(selectedPoolAsset, () =>
            Error(intl.formatMessage({ id: 'swap.errors.asset.missingSourceAsset' }))
          )
        )
      ),
    RD.initial
  )

  const targetAssetRD = RD.fromOption(oTarget, () =>
    Error(intl.formatMessage({ id: 'swap.errors.asset.missingTargetAsset' }))
  )

  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const selectedPoolAddress = useObservableState(selectedPoolAddress$, O.none)
  const targetWalletAddress = useObservableState(assetAddress$, O.none)

  const getExplorerUrl$ = useMemo(() => getExplorerUrlByAsset$(assetFromString(source.toUpperCase())), [
    source,
    getExplorerUrlByAsset$
  ])
  const explorerUrl = useObservableState(getExplorerUrl$, O.none)

  const goToTransaction = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [explorerUrl]
  )

  const renderError = useCallback(
    (e: Error) => (
      <ErrorView
        title={intl.formatMessage({ id: 'common.error' })}
        subTitle={e.message}
        extra={<Button onClick={reloadPools}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
      />
    ),
    [intl, reloadPools]
  )

  const onChangePath = useCallback(
    (path) => {
      history.replace(path)
    },
    [history]
  )
  return (
    <>
      <BackLink />
      <Styled.ContentContainer>
        {FP.pipe(
          sequenceTRD(poolsState, selectedPoolAssetRD, targetAssetRD),
          RD.fold(
            () => <></>,
            () => <Spin size="large" />,
            renderError,
            ([{ assetDetails: availableAssets, poolDetails }, sourceAsset, targetAsset]) => {
              const hasRuneAsset = Boolean(availableAssets.find(({ asset }) => isRuneNativeAsset(asset)))

              if (!hasRuneAsset) {
                availableAssets.unshift({ asset: AssetRuneNative, assetPrice: bnOrZero(1) })
              }

              return (
                <Swap
                  keystore={keystore}
                  validatePassword$={validatePassword$}
                  goToTransaction={goToTransaction}
                  sourceAsset={sourceAsset}
                  targetAsset={targetAsset}
                  poolAddress={selectedPoolAddress}
                  availableAssets={availableAssets}
                  poolDetails={poolDetails}
                  walletBalances={balances}
                  reloadFees={reloadSwapFees}
                  fees$={swapFees$}
                  targetWalletAddress={targetWalletAddress}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangePath={onChangePath}
                  network={network}
                  approveERC20Token$={approveERC20Token$}
                  isApprovedERC20Token$={isApprovedERC20Token$}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
