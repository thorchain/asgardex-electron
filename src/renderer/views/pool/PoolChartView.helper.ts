import { baseAmount, baseToAsset, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import moment from 'moment'

import { DepthHistoryItems, SwapHistoryItems } from '../../services/midgard/types'
import { DepthHistoryItem, SwapHistoryItem } from '../../types/generated/midgard'

// Get end of date time
export const getEoDTime = () => {
  return moment()
    .set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999
    })
    .unix()
}

export const getWeekAgoTime = () => {
  return moment()
    .subtract(7, 'days')
    .set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999
    })
    .unix()
}

export const fromDepthHistoryItems = (items: DepthHistoryItems, priceRatio: BigNumber) =>
  FP.pipe(
    items,
    A.map((interval: DepthHistoryItem) => ({
      time: Number(interval.startTime),
      // Note: `runeDepth` needs to be multiplied by 2 to get all depth of a pool
      value: baseToAsset(baseAmount(bnOrZero(interval.runeDepth).multipliedBy(2).multipliedBy(priceRatio)))
        .amount()
        .toFixed(3)
    }))
  )

export const fromSwapHistoryItems = (items: SwapHistoryItems, priceRatio: BigNumber) =>
  FP.pipe(
    items,
    A.map((interval: SwapHistoryItem) => ({
      time: Number(interval.startTime),
      value: baseToAsset(baseAmount(bnOrZero(interval.totalVolume).multipliedBy(priceRatio)))
        .amount()
        .toFixed(3)
    }))
  )
