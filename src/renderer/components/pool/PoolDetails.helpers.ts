import { AssetAmount, assetAmount, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { PoolDetail, PoolStatsDetail } from '../../types/generated/midgard'

export const getLiquidity = (
  { runeDepth }: Pick<PoolDetail, 'runeDepth'>,
  priceRatio: BigNumber = bn(1)
): AssetAmount =>
  baseToAsset(
    baseAmount(
      bnOrZero(runeDepth)
        .multipliedBy(2) /* liquidity = 2 * depth */
        .multipliedBy(priceRatio)
    )
  )

export const getVolume24 = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)): AssetAmount =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

export const getVolumeTotal = (
  {
    swapVolume,
    addLiquidityVolume,
    withdrawCount
  }: Pick<PoolStatsDetail, 'swapVolume' | 'addLiquidityVolume' | 'withdrawCount'>,
  priceRatio: BigNumber = bn(1)
): AssetAmount =>
  baseToAsset(
    baseAmount(bnOrZero(swapVolume))
      .plus(baseAmount(bnOrZero(addLiquidityVolume)))
      .plus(baseAmount(bnOrZero(withdrawCount)))
      .times(priceRatio)
  )

export const getAPY = (data: Pick<PoolDetail, 'poolAPY'>): BigNumber => bnOrZero(data.poolAPY).multipliedBy(100)

export const getPrice = (data: Pick<PoolDetail, 'assetPrice'>, priceRatio: BigNumber = bn(1)): AssetAmount =>
  assetAmount(bnOrZero(data.assetPrice).multipliedBy(priceRatio))

export const getTotalSwaps = (data: Pick<PoolStatsDetail, 'swapCount'>) => bnOrZero(data.swapCount)

export const getTotalTx = (
  data: Pick<PoolStatsDetail, 'swapCount' | 'addLiquidityCount' | 'withdrawCount'>
): BigNumber => bnOrZero(data.swapCount).plus(bnOrZero(data.addLiquidityCount)).plus(bnOrZero(data.withdrawCount))

export const getMembers = (data: Pick<PoolStatsDetail, 'uniqueMemberCount'>): BigNumber =>
  bnOrZero(data.uniqueMemberCount)

export const getFees = (data: Pick<PoolStatsDetail, 'totalFees'>, priceRatio: BigNumber = bn(1)): AssetAmount =>
  baseToAsset(baseAmount(bnOrZero(data.totalFees).multipliedBy(priceRatio)))

export const getILPPaid = (
  { impermanentLossProtectionPaid }: Pick<PoolStatsDetail, 'impermanentLossProtectionPaid'>,
  priceRatio: BigNumber = bn(1)
): AssetAmount => baseToAsset(baseAmount(bnOrZero(impermanentLossProtectionPaid).multipliedBy(priceRatio)))

export const getEmptyPoolDetail = (): PoolDetail => ({
  asset: 'asset',
  assetDepth: '0',
  assetPrice: '0',
  assetPriceUSD: '0',
  poolAPY: '0',
  runeDepth: '0',
  status: '',
  units: '0',
  volume24h: '',
  liquidityUnits: '0',
  synthUnits: '0',
  synthSupply: '0',
  annualPercentageRate: '0'
})

export const getEmptyPoolStatsDetail = (): PoolStatsDetail => ({
  addAssetLiquidityVolume: '0',
  addLiquidityCount: '0',
  addLiquidityVolume: '0',
  addRuneLiquidityVolume: '0',
  asset: 'asset',
  assetDepth: '0',
  assetPrice: '0',
  assetPriceUSD: '0',
  averageSlip: '0',
  poolAPY: '0',
  runeDepth: '0',
  status: 'Staged',
  swapCount: '0',
  swapVolume: '0',
  toAssetAverageSlip: '0',
  toAssetCount: '0',
  toAssetFees: '0',
  toAssetVolume: '0',
  toRuneAverageSlip: '0',
  toRuneCount: '0',
  toRuneFees: '0',
  toRuneVolume: '0',
  totalFees: '0',
  uniqueMemberCount: '0',
  uniqueSwapperCount: '0',
  units: '0',
  withdrawAssetVolume: '0',
  withdrawCount: '0',
  withdrawRuneVolume: '0',
  withdrawVolume: '0',
  impermanentLossProtectionPaid: '0',
  liquidityUnits: '0',
  synthUnits: '0',
  synthSupply: '0',
  annualPercentageRate: '0'
})
