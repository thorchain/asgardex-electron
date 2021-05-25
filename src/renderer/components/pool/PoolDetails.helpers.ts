import { assetAmount, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'
import * as FP from 'fp-ts/pipeable'

import { ZERO_ASSET_AMOUNT } from '../../const'
import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../types/generated/midgard/models'

export const getLiquidity = (data: Pick<PoolDetail, 'runeDepth'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(
    baseAmount(
      bnOrZero(data.runeDepth)
        .multipliedBy(2) /* liquidity = 2 * depth */
        .multipliedBy(priceRatio)
    )
  )

export const getVolume = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

export const getAPY = (data: Pick<PoolDetail, 'poolAPY'>) => bnOrZero(data.poolAPY).multipliedBy(100)

export const getPrice = (data: Pick<PoolDetail, 'assetPrice'>, priceRatio: BigNumber = bn(1)) =>
  assetAmount(bnOrZero(data.assetPrice).multipliedBy(priceRatio))

export const getTotalSwaps = (data: Pick<PoolStatsDetail, 'swapCount'>) => bnOrZero(data.swapCount)

export const getTotalTx = (data: Pick<PoolStatsDetail, 'swapCount' | 'addLiquidityCount' | 'withdrawCount'>) =>
  bnOrZero(data.swapCount).plus(bnOrZero(data.addLiquidityCount)).plus(bnOrZero(data.withdrawCount))

export const getMembers = (data: Pick<PoolStatsDetail, 'uniqueMemberCount'>) => bnOrZero(data.uniqueMemberCount)

export const getFees = (data: Pick<PoolStatsDetail, 'totalFees'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.totalFees).multipliedBy(priceRatio)))

export const getEarnings = (
  oData: O.Option<Pick<EarningsHistoryItemPool, 'earnings'>>,
  priceRatio: BigNumber = bn(1)
) =>
  FP.pipe(
    oData,
    O.fold(
      () => ZERO_ASSET_AMOUNT,
      (data) => baseToAsset(baseAmount(bnOrZero(data.earnings).multipliedBy(priceRatio)))
    )
  )
