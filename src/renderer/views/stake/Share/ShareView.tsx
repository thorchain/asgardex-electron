import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, baseAmount, bnOrZero, getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { Spin } from 'antd'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import PoolShare from '../../../components/uielements/poolShare'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { getDefaultRuneAsset } from '../../../helpers/assetHelper'
import { getDefaultRunePricePool } from '../../../helpers/poolHelper'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard'
import * as helpers from './ShareView.helper'
import * as Styled from './ShareView.styles'

export const ShareView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolDetail$, selectedPricePoolAssetSymbol$, selectedPricePool$, runeAsset$ }
  } = midgardService

  const intl = useIntl()

  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */
  const stakeData$ = useMemo(() => midgardService.stake.getStakes$(asset), [asset, midgardService.stake])
  const stakeData = useObservableState<StakersAssetDataRD>(stakeData$, RD.initial)

  const runeAsset = useObservableState(runeAsset$, getDefaultRuneAsset())
  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)
  const priceSymbol = useObservableState<O.Option<string>>(selectedPricePoolAssetSymbol$, O.none)

  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, getDefaultRunePricePool())

  const renderPoolShareReady = useCallback(
    (stake: StakersAssetData, poolDetail: PoolDetail) => {
      const runeShare = helpers.getRuneShare(stake, poolDetail)
      const assetShare = helpers.getAssetShare(stake, poolDetail)
      const poolShare = helpers.getPoolShare(stake, poolDetail)
      // stake units are RUNE based, provided as `BaseAmount`
      const stakeUnits = baseAmount(bnOrZero(stake.units))

      const poolData = toPoolData(poolDetail)

      const assetStakedPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
      const runeStakedPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

      return (
        <PoolShare
          sourceAsset={runeAsset}
          targetAsset={asset}
          poolShare={poolShare}
          stakeUnits={stakeUnits}
          assetStakedShare={assetShare}
          basePriceSymbol={FP.pipe(
            priceSymbol,
            O.getOrElse(() => '')
          )}
          loading={false}
          assetStakedPrice={assetStakedPrice}
          runeStakedPrice={runeStakedPrice}
          runeStakedShare={runeShare}
        />
      )
    },
    [asset, pricePoolData, priceSymbol, runeAsset]
  )

  const renderPoolShare = useMemo(
    () =>
      FP.pipe(
        RD.combine(stakeData, poolDetailRD),
        RD.fold(
          () => <Styled.EmptyData description={intl.formatMessage({ id: 'stake.pool.noStakes' })} />,
          () => (
            <Styled.EmptyContainer>
              <Spin />
            </Styled.EmptyContainer>
          ),
          () => <Styled.EmptyData description={intl.formatMessage({ id: 'stake.pool.noStakes' })} />,
          ([stake, pool]) => renderPoolShareReady(stake, pool)
        )
      ),

    [intl, poolDetailRD, renderPoolShareReady, stakeData]
  )

  return renderPoolShare
}
