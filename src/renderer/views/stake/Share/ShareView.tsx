import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, baseAmount, bnOrZero } from '@thorchain/asgardex-util'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import PoolShare from '../../../components/uielements/poolShare'
import { ONE_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import * as helpers from './ShareView.helper'
import * as Styled from './ShareView.styles'

export const ShareView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const { service: midgardService } = useMidgardContext()

  const intl = useIntl()

  const stakeData = useObservableState(midgardService.stake.stakes$, RD.initial)
  const poolDetailedInfo = useObservableState(midgardService.pools.poolDetailedState$, RD.initial)
  const runePriceRatio = useObservableState(midgardService.pools.priceRatio$, ONE_BN)
  const priceSymbol = useObservableState(midgardService.pools.selectedPricePoolAssetSymbol$, '')

  return pipe(
    RD.combine(stakeData, poolDetailedInfo),
    RD.fold(
      () => <Styled.EmptyData description={intl.formatMessage({ id: 'stake.pool.noStakes' })} />,
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
            target={asset.chain}
            poolShare={helpers.getPoolShare(stake, pool)}
            assetStakedShare={assetStakedShare}
            basePriceAsset={priceSymbol}
            loading={false}
            assetStakedPrice={helpers.getAssetSharePrice(assetShare, bnOrZero(pool.price), runePriceRatio)}
            runeStakedPrice={runeStakedPrice}
            runeStakedShare={runeStakedShare}
          />
        )
      }
    )
  )
}
