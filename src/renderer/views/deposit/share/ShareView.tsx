import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { PoolShare as PoolShareUI } from '../../../components/uielements/poolShare'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import { PoolDetailRD, PoolDetail, PoolShareRD, PoolShare } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import * as Styled from './ShareView.styles'

type Props = { asset: Asset; poolShare: PoolShareRD }

export const ShareView: React.FC<Props> = ({ asset, poolShare: poolShareRD }) => {
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolDetail$, selectedPricePoolAsset$, selectedPricePool$ }
  } = midgardService

  const intl = useIntl()

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)

  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const renderPoolShareReady = useCallback(
    ({ units }: PoolShare, poolDetail: PoolDetail) => {
      const runeShare = shareHelpers.getRuneShare(units, poolDetail)
      const assetShare = shareHelpers.getAssetShare(units, poolDetail)
      const poolShare = shareHelpers.getPoolShare(units, poolDetail)

      const poolData = toPoolData(poolDetail)

      const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
      const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

      return (
        <PoolShareUI
          sourceAsset={AssetRuneNative}
          targetAsset={asset}
          poolShare={poolShare}
          depositUnits={units}
          assetDepositShare={assetShare}
          priceAsset={FP.pipe(oPriceAsset, O.toUndefined)}
          loading={false}
          assetDepositPrice={assetDepositPrice}
          runeDepositPrice={runeDepositPrice}
          runeDepositShare={runeShare}
        />
      )
    },
    [asset, oPriceAsset, pricePoolData]
  )

  const renderNoShare = useMemo(
    () => <Styled.EmptyData description={intl.formatMessage({ id: 'deposit.pool.noDeposit' })} />,
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
