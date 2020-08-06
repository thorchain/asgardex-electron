import React from 'react'

import { fold, initial } from '@devexperts/remote-data-ts'
import { assetFromString, Asset, bnOrZero } from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import { pipe } from 'fp-ts/lib/pipeable'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import { Swap } from '../../components/swap/Swap'
import BackLink from '../../components/uielements/backLink'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { SwapRouteParams } from '../../routes/swap'
import * as Styled from './SwapView.styles'

type Props = {}

const SwapView: React.FC<Props> = (_): JSX.Element => {
  const { source, target } = useParams<SwapRouteParams>()

  const { service: midgardService } = useMidgardContext()
  const { poolsState$ } = midgardService
  const poolsState = useObservableState(poolsState$, initial)
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

              return (
                <Swap
                  sourceAsset={assetFromString(source.toUpperCase()) || availableAssets[0].asset}
                  targetAsset={assetFromString(target.toUpperCase()) || availableAssets[0].asset}
                  onConfirmSwap={console.log}
                  availableAssets={availableAssets}
                  poolDetails={state.poolDetails}
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
