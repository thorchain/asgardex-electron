import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetAmount, assetFromString, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { PoolStatus } from '../../components/uielements/poolStatus'
import { ZERO_ASSET_AMOUNT, ONE_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { PoolDetailRD, PoolEarningHistoryRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../types/generated/midgard'

// TODO (@asgdx-team) Extract follwing helpers into PoolDetailsView.helper + add tests

const getDepth = (data: Pick<PoolDetail, 'runeDepth'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const getVolume = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

const getEarnings = (oData: O.Option<EarningsHistoryItemPool>, priceRatio: BigNumber = bn(1)) =>
  FP.pipe(
    oData,
    O.fold(
      () => ZERO_ASSET_AMOUNT,
      (data) => baseToAsset(baseAmount(bnOrZero(data.earnings).multipliedBy(priceRatio)))
    )
  )

const getPrice = (data: Pick<PoolDetail, 'assetPrice'>, priceRatio: BigNumber = bn(1)) =>
  assetAmount(bnOrZero(data.assetPrice).multipliedBy(priceRatio))

const getTotalSwaps = (data: Pick<PoolStatsDetail, 'swapCount'>) => bn(data.swapCount)

const getTotalTx = (data: PoolStatsDetail) => bn(data.swapCount).plus(data.addLiquidityCount).plus(data.withdrawCount)

const getMembers = (data: Pick<PoolStatsDetail, 'uniqueMemberCount'>) => bn(data.uniqueMemberCount)

const getFees = (data: Pick<PoolStatsDetail, 'totalFees'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.totalFees).multipliedBy(priceRatio)))

const getAPY = (data: Pick<PoolDetail, 'poolAPY'>) => bn(data.poolAPY).plus(1).multipliedBy(100)

const defaultDetailsProps: PoolDetailProps = {
  asset: O.none,
  liquidity: ZERO_ASSET_AMOUNT,
  volumn: ZERO_ASSET_AMOUNT,
  earnings: ZERO_ASSET_AMOUNT,
  fees: ZERO_ASSET_AMOUNT,
  totalTx: bn(0),
  totalSwaps: bn(0),
  members: bn(0),
  apy: bn(0),
  price: ZERO_ASSET_AMOUNT
}

const renderPendingView = () => <PoolDetails {...defaultDetailsProps} isLoading={true} />
const renderInitialView = () => <PoolDetails {...defaultDetailsProps} />

export const PoolDetailsView: React.FC = () => {
  const {
    service: {
      pools: { selectedPoolDetail$, priceRatio$, selectedPricePoolAssetSymbol$, poolStatsDetail$, poolEarningHistory$ },
      setSelectedPoolAsset
    }
  } = useMidgardContext()

  const intl = useIntl()

  const { asset } = useParams<PoolDetailRouteParams>()

  const oRouteAsset = useMemo(() => O.fromNullable(assetFromString(asset.toUpperCase())), [asset])

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oRouteAsset)
    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oRouteAsset, setSelectedPoolAsset])

  const routeAssetRD = RD.fromOption(oRouteAsset, () =>
    Error(intl.formatMessage({ id: 'routes.invalid.asset' }, { asset }))
  )

  const priceSymbol = useObservableState(selectedPricePoolAssetSymbol$, O.none)

  const priceRatio = useObservableState(priceRatio$, ONE_BN)

  const poolDetailRD: PoolDetailRD = useObservableState(selectedPoolDetail$, RD.initial)

  const poolStatsDetailRD: PoolStatsDetailRD = useObservableState(poolStatsDetail$, RD.initial)
  const poolEarningHistoryRD: PoolEarningHistoryRD = useObservableState(poolEarningHistory$, RD.initial)

  return FP.pipe(
    RD.combine(routeAssetRD, poolDetailRD, poolStatsDetailRD, poolEarningHistoryRD),
    RD.fold(
      renderInitialView,
      renderPendingView,
      (e: Error) => {
        return <PoolStatus label={intl.formatMessage({ id: 'common.error' })} displayValue={e.message} />
      },
      ([asset, poolDetail, poolStatsDetail, poolEarningHistory]) => {
        return (
          <PoolDetails
            asset={O.some(asset)}
            liquidity={getDepth(poolDetail, priceRatio)}
            volumn={getVolume(poolDetail, priceRatio)}
            earnings={getEarnings(poolEarningHistory, priceRatio)}
            fees={getFees(poolStatsDetail, priceRatio)}
            totalTx={getTotalTx(poolStatsDetail)}
            totalSwaps={getTotalSwaps(poolStatsDetail)}
            members={getMembers(poolStatsDetail)}
            apy={getAPY(poolDetail)}
            price={getPrice(poolDetail, priceRatio)}
            priceSymbol={O.toUndefined(priceSymbol)}
          />
        )
      }
    )
  )
}
