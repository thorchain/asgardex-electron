import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../renderer/types/generated/midgard/models'

export const poolDetailMock: PoolDetail = {
  asset: 'asset',
  assetDepth: '0',
  assetPrice: '0',
  assetPriceUSD: '0',
  poolAPY: '0',
  runeDepth: '0',
  status: '',
  units: '0',
  volume24h: ''
}

export const poolStatsDetailMock: PoolStatsDetail = {
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
  impermanentLossProtectionPaid: '0'
}

export const earningsHistoryItemPoolMock: EarningsHistoryItemPool = {
  assetLiquidityFees: '0',
  earnings: '0',
  pool: 'BNB.BNB',
  rewards: '0',
  runeLiquidityFees: '0',
  totalLiquidityFeesRune: '0'
}
