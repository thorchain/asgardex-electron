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

import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { BackLink } from '../../components/uielements/backLink'
import { Button } from '../../components/uielements/button'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { SwapRouteParams } from '../../routes/swap'
import { SwapFeesLD, SwapFeesRD } from '../../services/chain/types'
import { PoolAddressRx } from '../../services/midgard/types'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()
  const history = useHistory()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, reloadPools, selectedPricePool$, poolAddressByAsset$ },
    setSelectedPoolAsset
  } = midgardService
  const { reloadSwapFees, swapFees$, getExplorerUrlByAsset$, assetAddress$, swap$ } = useChainContext()

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

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

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

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

  const swapFeesLD: SwapFeesLD = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oSource, oTarget),
        O.map(([sourceAsset, targetAsset]) => swapFees$(sourceAsset, targetAsset)),
        O.getOrElse((): SwapFeesLD => Rx.EMPTY)
      ),
    [oSource, oTarget, swapFees$]
  )

  const swapFeesRD: SwapFeesRD = useObservableState(swapFeesLD, RD.initial)

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
          poolsState,
          fold(
            () => <></>,
            () => <Spin size="large" />,
            renderError,
            (state) => {
              const availableAssets = state.assetDetails
                .filter((a) => a.asset !== undefined && !!a.asset)
                .map((a) => ({ asset: assetFromString(a.asset as string) as Asset, priceRune: bnOrZero(a.priceRune) }))

              const hasRuneAsset = Boolean(availableAssets.find(({ asset }) => isRuneNativeAsset(asset)))

              if (!hasRuneAsset) {
                availableAssets.unshift({ asset: AssetRuneNative, priceRune: bnOrZero(1) })
              }

              return (
                <Swap
                  validatePassword$={validatePassword$}
                  activePricePool={selectedPricePool}
                  goToTransaction={goToTransaction}
                  sourceAsset={oSource}
                  targetAsset={oTarget}
                  sourcePoolAddress={sourcePoolAddress}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
                  walletBalances={balances}
                  reloadFees={reloadSwapFees}
                  fees={swapFeesRD}
                  targetWalletAddress={targetWalletAddress}
                  swap$={swap$}
                  reloadBalances={reloadBalances}
                  onChangePath={onChangePath}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
