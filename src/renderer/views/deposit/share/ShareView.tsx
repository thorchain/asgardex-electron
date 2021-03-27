import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { PoolShare as PoolShareUI } from '../../../components/uielements/poolShare'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { to1e8BaseAmount } from '../../../helpers/assetHelper'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import * as ShareHelpers from '../../../helpers/poolShareHelper'
import { PoolDetailRD, PoolShareRD, PoolShare } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { AssetWithDecimal } from '../../../types/asgardex'
import { PoolDetail } from '../../../types/generated/midgard'
import * as Styled from './ShareView.styles'

type Props = {
  asset: AssetWithDecimal
  poolShare: PoolShareRD
  smallWidth?: boolean
}

export const ShareView: React.FC<Props> = ({ asset: assetWD, poolShare: poolShareRD, smallWidth }) => {
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { selectedPoolDetail$, selectedPricePoolAsset$, selectedPricePool$ }
  } = midgardService

  const intl = useIntl()

  const poolDetailRD = useObservableState<PoolDetailRD>(selectedPoolDetail$, RD.initial)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)

  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const renderPoolShareReady = useCallback(
    ({ units }: PoolShare, poolDetail: PoolDetail) => {
      const runeShare: BaseAmount = ShareHelpers.getRuneShare(units, poolDetail)
      const assetShare: BaseAmount = ShareHelpers.getAssetShare({
        liquidityUnits: units,
        detail: poolDetail,
        assetDecimal: assetWD.decimal
      })
      const poolShare = ShareHelpers.getPoolShare(units, poolDetail)

      const poolData = toPoolData(poolDetail)

      const assetPrice: BaseAmount = getValueOfAsset1InAsset2(
        // Note: `assetShare` needs to be converted to 1e8,
        // since it based on asset decimal, which might be different
        to1e8BaseAmount(assetShare),
        poolData,
        pricePoolData
      )
      const runePrice: BaseAmount = getValueOfRuneInAsset(runeShare, pricePoolData)

      return (
        <PoolShareUI
          asset={assetWD}
          poolShare={poolShare}
          depositUnits={units}
          shares={{ rune: runeShare, asset: assetShare }}
          priceAsset={FP.pipe(oPriceAsset, O.toUndefined)}
          loading={false}
          assetPrice={assetPrice}
          runePrice={runePrice}
          smallWidth={smallWidth}
        />
      )
    },
    [assetWD, oPriceAsset, pricePoolData, smallWidth]
  )

  const renderNoShare = useMemo(
    () => (
      <Styled.EmptyData
        description={intl.formatMessage({
          id: 'deposit.pool.noShares'
        })}
      />
    ),
    [intl]
  )

  const renderPoolShare = useMemo(
    () =>
      FP.pipe(
        RD.combine(poolShareRD, poolDetailRD),
        RD.fold(
          () => renderNoShare,
          () => <Spin />,
          () => renderNoShare,
          ([oPoolShare, pool]) =>
            FP.pipe(
              oPoolShare,
              O.fold(
                () => renderNoShare,
                (poolShare) => renderPoolShareReady(poolShare, pool)
              )
            )
        )
      ),

    [poolShareRD, poolDetailRD, renderNoShare, renderPoolShareReady]
  )

  return renderPoolShare
}
