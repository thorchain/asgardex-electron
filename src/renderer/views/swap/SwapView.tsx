import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { fold, initial } from '@devexperts/remote-data-ts'
import { Asset, AssetAmount, assetFromString, bnOrZero } from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { ErrorView } from '../../components/shared/error/'
import { Swap } from '../../components/swap/Swap'
import { BackLink } from '../../components/uielements/backLink'
import { Button } from '../../components/uielements/button'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getDefaultRuneAsset, isRuneAsset } from '../../helpers/assetHelper'
import { rdFromOption } from '../../helpers/fpHelpers'
import { getDefaultRunePricePool } from '../../helpers/poolHelper'
import { SwapRouteParams } from '../../routes/swap'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'
import * as Styled from './SwapView.styles'

type Props = {}

export const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()
  const intl = useIntl()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, poolAddresses$, reloadPools, runeAsset$, selectedPricePool$ }
  } = midgardService
  const { transaction, explorerUrl$ } = useBinanceContext()
  const { assetsWBState$ } = useWalletContext()
  const poolsState = useObservableState(poolsState$, initial)
  const [poolAddresses] = useObservableState(() => poolAddresses$, initial)

  const runeAsset = useObservableState(runeAsset$, getDefaultRuneAsset())

  const selectedPricePool = useObservableState(selectedPricePool$, getDefaultRunePricePool())

  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const [txWithState] = useObservableState(() => transaction.txWithState$, RD.initial)

  const onConfirmSwap = useCallback(
    (source: Asset, amount: AssetAmount, memo: string) => {
      pipe(
        poolAddresses,
        RD.map(A.head),
        RD.chain(rdFromOption(() => Error(''))),
        // eslint-disable-next-line array-callback-return
        RD.map((endpoint) => {
          if (endpoint.address) {
            transaction.pushTx({
              to: endpoint.address || '',
              amount,
              asset: source,
              memo
            })
          }
        })
      )
    },
    [poolAddresses, transaction]
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

              const hasRuneAsset = Boolean(availableAssets.find(({ asset }) => isRuneAsset(asset)))

              if (!hasRuneAsset && runeAsset) {
                availableAssets.unshift({ asset: runeAsset, priceRune: bnOrZero(1) })
              }

              return (
                <Swap
                  runeAsset={runeAsset}
                  activePricePool={selectedPricePool}
                  txWithState={txWithState}
                  resetTx={transaction.resetTx}
                  goToTransaction={goToTransaction}
                  sourceAsset={O.fromNullable(assetFromString(source.toUpperCase()))}
                  targetAsset={O.fromNullable(assetFromString(target.toUpperCase()))}
                  onConfirmSwap={onConfirmSwap}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
                  assetsWB={assetsWB}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}
