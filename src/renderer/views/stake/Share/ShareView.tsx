import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetAmount, assetFromString, assetToBase, baseAmount, bnOrZero } from '@thorchain/asgardex-util'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import PoolShare from '../../../components/uielements/poolShare'
import { ONE_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { StakeRouteParams } from '../../../routes/stake'
import * as helpers from './ShareView.helper'
import * as Styled from './ShareView.styles'

export const ShareView: React.FC = () => {
  const { asset: assetParam } = useParams<StakeRouteParams>()
  const { service: midgardService } = useMidgardContext()
  const stakeData = useObservableState(midgardService.stake.stakes$, RD.initial)
  const poolDetailedInfo = useObservableState(midgardService.pools.poolDetailedState$, RD.initial)
  const runePriceRatio = useObservableState(midgardService.pools.priceRatio$, ONE_BN)
  const priceSymbol = useObservableState(midgardService.pools.selectedPricePoolAssetSymbol$, '')
  const asset = assetFromString(assetParam.toUpperCase())

  return pipe(
    RD.combine(stakeData, poolDetailedInfo),
    RD.fold(
      () => <Styled.EmptyData description={"YOU DON'T HAVE ANY SHARES IN THIS POOL."} />,
      helpers.renderPending,
      (e) => <Styled.EmptyData description={e.message} />,
      ([stake, pool]) => {
        const runeShare = helpers.getRuneShare(stake, pool)
        const assetShare = helpers.getAssetShare(stake, pool)
        const runeStakedShare = baseAmount(runeShare)
        const runeStakedPrice = baseAmount(runePriceRatio.multipliedBy(runeShare))
        const assetStakedShare = baseAmount(assetShare)
        return (
          <PoolShare
            source="RUNE"
            target={asset?.chain || ''}
            poolShare={helpers.getPoolShare(stake, pool)}
            assetEarnedAmount={assetToBase(assetAmount(200))}
            assetEarnedPrice={assetToBase(assetAmount(300))}
            assetStakedShare={assetStakedShare}
            basePriceAsset={priceSymbol}
            loading={false}
            assetStakedPrice={helpers.getAssetSharePrice(assetShare, bnOrZero(pool.price), runePriceRatio)}
            runeEarnedAmount={assetToBase(assetAmount(200))}
            runeEarnedPrice={assetToBase(assetAmount(300))}
            runeStakedPrice={runeStakedPrice}
            runeStakedShare={runeStakedShare}
          />
        )
      }
    )
  )
}
