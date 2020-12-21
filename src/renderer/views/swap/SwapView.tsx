import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { fold, initial } from '@devexperts/remote-data-ts'
import { Asset, AssetAmount, assetFromString, AssetRuneNative, assetToBase, bnOrZero } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap'
import { BackLink } from '../../components/uielements/backLink'
import { Button } from '../../components/uielements/button'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { liveData } from '../../helpers/rx/liveData'
import { SwapRouteParams } from '../../routes/swap'
import { SwapFeesLD, SwapFeesRD } from '../../services/chain/types'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import { ConfirmPasswordView } from '../wallet/ConfirmPassword'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, selectedPoolAddress$, reloadPools, selectedPricePool$ },
    getTransactionState$,
    setSelectedPoolAsset
  } = midgardService
  const { reloadSwapFees, swapFees$ } = useChainContext()
  const { explorerUrl$, subscribeTx, resetTx, txRD$ } = useBinanceContext()
  const { balancesState$ } = useWalletContext()
  const poolsState = useObservableState(poolsState$, initial)
  const poolAddress = useObservableState(selectedPoolAddress$, O.none)

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

  const txWithState$ = useMemo(
    () =>
      FP.pipe(
        txRD$,
        liveData.mapLeft((e) => Error(e.msg)),
        liveData.chain((tx) =>
          FP.pipe(
            getTransactionState$(tx),
            liveData.map((state) => ({
              state,
              txHash: tx
            }))
          )
        )
      ),
    [txRD$, getTransactionState$]
  )

  const [txWithState] = useObservableState(() => txWithState$, RD.initial)

  const onConfirmSwap = useCallback(
    (source: Asset, amount: AssetAmount, memo: string) => {
      pipe(
        poolAddress,
        // TODO (@Veado)
        // Do a health check for pool address before sending tx
        // Issue #497: https://github.com/thorchain/asgardex-electron/issues/497
        // eslint-disable-next-line array-callback-return
        O.map((endpoint) => {
          if (endpoint) {
            subscribeTx({
              recipient: endpoint,
              amount: assetToBase(amount),
              asset: source,
              memo
            })
          }
        })
      )
    },
    [poolAddress, subscribeTx]
  )

  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const goToTransaction = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
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

  return (
    <>
      <BackLink />
      <Styled.ContentContainer>
        {pipe(
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
                  PasswordConfirmation={ConfirmPasswordView}
                  activePricePool={selectedPricePool}
                  txWithState={txWithState}
                  resetTx={resetTx}
                  goToTransaction={goToTransaction}
                  sourceAsset={oSource}
                  targetAsset={oTarget}
                  onConfirmSwap={onConfirmSwap}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
                  walletBalances={balances}
                  reloadFees={reloadSwapFees}
                  fees={swapFeesRD}
                  poolAddress={poolAddress}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
