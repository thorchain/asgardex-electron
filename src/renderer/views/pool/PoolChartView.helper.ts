import { baseAmount, baseToAsset, bnOrZero } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { ChartDetails } from '../../components/uielements/chart/PoolDetailsChart.types'
import { DepthHistoryItem, LiquidityHistoryItem, SwapHistoryItem } from '../../types/generated/midgard'

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
