import { baseAmount, baseToAsset, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ChartDataType, ChartDetails, ChartTimeFrame } from '../../components/uielements/chart/PoolDetailsChart.types'
import { DepthHistoryItem, LiquidityHistoryItem, SwapHistoryItem } from '../../types/generated/midgard'
import { CachedChartData } from './PoolChartView.types'

type PartialDepthHistoryItem = Pick<DepthHistoryItem, 'startTime' | 'runeDepth'>

export const getLiquidityFromHistoryItems = (depthHistory: PartialDepthHistoryItem[]): ChartDetails =>
  FP.pipe(
    depthHistory,
    A.map(({ startTime, runeDepth }: PartialDepthHistoryItem) => {
      const amount = baseToAsset(
        baseAmount(bnOrZero(runeDepth))
          // Note: Pool depth = 2 x `runeDepth`
          .times(2)
      )

      return {
        time: Number(startTime),
        amount
      }
    })
  )

type PartialSwapHistoryItem = Pick<SwapHistoryItem, 'startTime' | 'totalVolume'>
type PartialLiquidityHistoryItem = Pick<LiquidityHistoryItem, 'addLiquidityVolume' | 'withdrawVolume'>

export const getVolumeFromHistoryItems = ({
  swapHistory,
  liquidityHistory
}: {
  swapHistory: PartialSwapHistoryItem[]
  liquidityHistory: PartialLiquidityHistoryItem[]
}): ChartDetails =>
  FP.pipe(
    A.zipWith(swapHistory, liquidityHistory, ({ startTime, totalVolume }, { addLiquidityVolume, withdrawVolume }) => ({
      startTime,
      totalVolume,
      addLiquidityVolume,
      withdrawVolume
    })),
    A.map(({ startTime, totalVolume, addLiquidityVolume, withdrawVolume }) => {
      const amount = baseToAsset(
        baseAmount(bnOrZero(totalVolume))
          .plus(baseAmount(bnOrZero(addLiquidityVolume)))
          .plus(baseAmount(bnOrZero(withdrawVolume)))
      )
      return {
        time: Number(startTime),
        amount
      }
    })
  )

export const INITIAL_CACHED_CHART_DATA: CachedChartData = {
  liquidity: { allTime: O.none, week: O.none },
  volume: { allTime: O.none, week: O.none }
}

export const getCachedChartData = ({
  timeFrame,
  dataType,
  cache
}: {
  timeFrame: ChartTimeFrame
  dataType: ChartDataType
  cache: CachedChartData
}): O.Option<ChartDetails> => cache[dataType][timeFrame]

export const updateCachedChartData = ({
  timeFrame,
  dataType,
  cache,
  data: oData
}: {
  timeFrame: ChartTimeFrame
  dataType: ChartDataType
  cache: CachedChartData
  data: O.Option<ChartDetails>
}): CachedChartData => ({
  ...cache,
  [dataType]: { ...cache[dataType], [timeFrame]: oData }
})
