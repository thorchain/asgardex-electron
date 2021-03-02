import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { fold, initial } from '@devexperts/remote-data-ts'
import { Asset, assetFromString, AssetRuneNative, bnOrZero } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { BackLink } from '../../components/uielements/backLink'
import { Button } from '../../components/uielements/button'
import { useAppContext } from '../../contexts/AppContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { SwapRouteParams } from '../../routes/swap'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolAddressRx } from '../../services/midgard/types'
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
    pools: { poolsState$, reloadPools, poolAddressByAsset$ },
    setSelectedPoolAsset
  } = midgardService
  const { reloadSwapFees, swapFee$, getExplorerUrlByAsset$, assetAddress$, swap$ } = useChainContext()

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { keystore$, validatePassword$ }
  } = useWalletContext()

  const keystore = useObservableState(keystore$, O.none)

  const poolsState = useObservableState(poolsState$, initial)

  const oSource = useMemo(() => O.fromNullable(assetFromString(source.toUpperCase())), [source])
  const oTarget = useMemo(() => O.fromNullable(assetFromString(target.toUpperCase())), [target])

  useEffect(() => {
    setSelectedPoolAsset(oTarget)

    // Reset selectedPoolAsset on view's unmount to avoid effects
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oTarget, setSelectedPoolAsset])

  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const sourcePoolAddress$ = useMemo(
    () =>
      FP.pipe(
        oSource,
        O.map(poolAddressByAsset$),
        O.getOrElse((): PoolAddressRx => Rx.EMPTY)
      ),
    [oSource, poolAddressByAsset$]
  )

  const sourcePoolAddress = useObservableState(sourcePoolAddress$, O.none)
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
          sequenceTRD(
            poolsState,
            RD.fromOption(oSource, () => Error(intl.formatMessage({ id: 'swap.errors.asset.missingSourceAsset' }))),
            RD.fromOption(oTarget, () => Error(intl.formatMessage({ id: 'swap.errors.asset.missingTargetAsset' })))
          ),
          fold(
            () => <></>,
            () => <Spin size="large" />,
            renderError,
            ([state, sourceAsset, targetAsset]) => {
              const availableAssets = state.assetDetails
                .filter((a) => a.asset !== undefined && !!a.asset)
                .map((a) => ({ asset: assetFromString(a.asset as string) as Asset, priceRune: bnOrZero(a.priceRune) }))

              const hasRuneAsset = Boolean(availableAssets.find(({ asset }) => isRuneNativeAsset(asset)))

              if (!hasRuneAsset) {
                availableAssets.unshift({ asset: AssetRuneNative, priceRune: bnOrZero(1) })
              }

              return (
                <Swap
                  keystore={keystore}
                  validatePassword$={validatePassword$}
                  goToTransaction={goToTransaction}
                  sourceAsset={sourceAsset}
                  targetAsset={targetAsset}
                  sourcePoolAddress={sourcePoolAddress}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
                  walletBalances={balances}
                  reloadFees={reloadSwapFees}
                  fees$={swapFee$}
                  targetWalletAddress={targetWalletAddress}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangePath={onChangePath}
                  network={network}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
