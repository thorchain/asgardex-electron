import React, { useCallback } from 'react'

import { fold, initial } from '@devexperts/remote-data-ts'
import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, Asset, bnOrZero, AssetAmount } from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import * as A from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import { Swap } from '../../components/swap/Swap'
import BackLink from '../../components/uielements/backLink'
import { RUNE_ASSET } from '../../const'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { rdFromOption } from '../../helpers/fpHelpers'
import { SwapRouteParams } from '../../routes/swap'
import { PoolAsset } from '../pools/types'
import * as Styled from './SwapView.styles'

type Props = {}

const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()

  const { service: midgardService } = useMidgardContext()
  const { transaction } = useBinanceContext()
  const { poolsState$, poolAddresses$ } = midgardService
  const poolsState = useObservableState(poolsState$, initial)
  const [poolAddresses] = useObservableState(() => poolAddresses$, initial)
  const { balancesState$ } = useBinanceContext()

  const balances = useObservableState(balancesState$)

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

  return (
    <>
      <BackLink />
      <Styled.ContentContainer>
        {pipe(
          poolsState,
          fold(
            () => <></>,
            () => <Spin size="large" />,
            () => <span>error</span>,
            (state) => {
              const availableAssets = state.assetDetails
                .filter((a) => a.asset !== undefined && !!a.asset)
                .map((a) => ({ asset: assetFromString(a.asset as string) as Asset, priceRune: bnOrZero(a.priceRune) }))

              const hasRuneAsset = Boolean(availableAssets.find((asset) => asset.asset.symbol === PoolAsset.RUNE67C))

              if (!hasRuneAsset) {
                availableAssets.unshift(RUNE_ASSET)
              }

              return (
                <Swap
                  sourceAsset={assetFromString(source.toUpperCase()) || availableAssets[0].asset}
                  targetAsset={assetFromString(target.toUpperCase()) || availableAssets[0].asset}
                  onConfirmSwap={onConfirmSwap}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
                  balances={balances}
                />
              )
            }
          )
        )}
      </Styled.ContentContainer>
    </>
  )
}

export default SwapView
