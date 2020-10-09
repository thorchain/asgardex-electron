import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, baseAmount, bnOrZero } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import PoolShare from '../../../components/uielements/poolShare'
import { ONE_BN, ZERO_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { getDefaultRuneAsset } from '../../../helpers/assetHelper'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard'
import * as helpers from './ShareView.helper'
import * as Styled from './ShareView.styles'

export const ShareView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolDetailedState$, selectedPricePoolAssetSymbol$, priceRatio$, runeAsset$ },
    stake: { stakes$ }
  } = midgardService

  const intl = useIntl()

  const stakeData = useObservableState<StakersAssetDataRD>(stakes$, RD.initial)
  const runeAsset = useObservableState(runeAsset$, getDefaultRuneAsset())
  const poolDetailedInfo = useObservableState<PoolDetailRD>(poolDetailedState$, RD.initial)
  const runePriceRatio = useObservableState(priceRatio$, ONE_BN)
  const priceSymbol = useObservableState<O.Option<string>>(selectedPricePoolAssetSymbol$, O.none)

  const renderPoolSharePending = useMemo(
    () => (
      <PoolShare
        sourceAsset={runeAsset}
        targetAsset={asset}
        poolShare={ZERO_BN}
        assetStakedPrice={baseAmount(0)}
        assetStakedShare={baseAmount(0)}
        basePriceSymbol=""
        loading={true}
        runeStakedPrice={baseAmount(0)}
        runeStakedShare={baseAmount(0)}
        stakeUnits={baseAmount(0)}
      />
    ),
    [asset, runeAsset]
  )

  const renderPoolShareReady = useCallback(
    (stake: StakersAssetData, pool: PoolDetail) => {
      const runeShare = helpers.getRuneShare(stake, pool)
      const assetShare = helpers.getAssetShare(stake, pool)
      const runeStakedPrice = baseAmount(runePriceRatio.multipliedBy(runeShare.amount()))
      const poolShare = helpers.getPoolShare(stake, pool)
      const assetStakedPrice = helpers.getAssetSharePrice(assetShare.amount(), bnOrZero(pool.price), runePriceRatio)
      // stake units are RUNE based, provided as `BaseAmount`
      const stakeUnits = baseAmount(bnOrZero(stake.units))
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
    [asset, priceSymbol, runeAsset, runePriceRatio]
  )

  const renderPoolShare = useMemo(
    () =>
      FP.pipe(
        RD.combine(stakeData, poolDetailedInfo),
        RD.fold(
          () => <Styled.EmptyData description={intl.formatMessage({ id: 'stake.pool.noStakes' })} />,
          () => renderPoolSharePending,
          (e) => <Styled.EmptyData description={e.message} />,
          ([stake, pool]) => renderPoolShareReady(stake, pool)
        )
      ),

    [intl, poolDetailedInfo, renderPoolSharePending, renderPoolShareReady, stakeData]
  )

  return renderPoolShare
}
