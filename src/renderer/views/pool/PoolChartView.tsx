import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { PoolChart } from '../../components/pool/PoolChart'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import { GetDepthHistoryIntervalEnum, GetSwapHistoryIntervalEnum } from '../../types/generated/midgard'
import { getEoDTime, getWeekAgoTime } from './PoolChartView.helper'

type Props = {
  isLoading?: boolean
  priceRatio: BigNumber
}

export const PoolChartView: React.FC<Props> = ({ isLoading, priceRatio }) => {
  const {
    service: {
      pools: { selectedPricePoolAsset$, getSwapHistory$, getDepthHistory$ }
    }
  } = useMidgardContext()

  const selectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  const curTime = getEoDTime()
  const weekAgoTime = getWeekAgoTime()

  const [swapAllHistoryRD] = useObservableState(
    () =>
      getSwapHistory$({
        interval: GetSwapHistoryIntervalEnum.Day
      }),
    RD.initial
  )
  const volumeAllTimeData = FP.pipe(
    swapAllHistoryRD,
    RD.toOption,
    O.map((history) =>
      history.intervals.map((interval) => ({
        time: Number(interval.startTime),
        poolVolume: interval.totalVolume
      }))
    )
  )

  const [swapWeekHistoryRD] = useObservableState(
    () =>
      getSwapHistory$({
        interval: GetSwapHistoryIntervalEnum.Day,
        from: weekAgoTime,
        to: curTime
      }),
    RD.initial
  )
  const volumeWeekData = FP.pipe(
    swapWeekHistoryRD,
    RD.toOption,
    O.map((history) =>
      history.intervals.map((interval) => ({
        time: Number(interval.startTime),
        poolVolume: interval.totalVolume
      }))
    )
  )

  const [depthAllHistoryRD] = useObservableState(
    () =>
      getDepthHistory$({
        interval: GetDepthHistoryIntervalEnum.Day
      }),
    RD.initial
  )
  const liquidityAllTimeData = FP.pipe(
    depthAllHistoryRD,
    RD.toOption,
    O.map((history) =>
      history.intervals.map((interval) => ({
        time: Number(interval.startTime),
        runeDepth: interval.runeDepth
      }))
    )
  )

  const [depthWeekHistoryRD] = useObservableState(
    () =>
      getDepthHistory$({
        interval: GetDepthHistoryIntervalEnum.Day,
        from: weekAgoTime,
        to: curTime
      }),
    RD.initial
  )
  const liquidityWeekData = FP.pipe(
    depthWeekHistoryRD,
    RD.toOption,
    O.map((history) =>
      history.intervals.map((interval) => ({
        time: Number(interval.startTime),
        runeDepth: interval.runeDepth
      }))
    )
  )

  return (
    <PoolChart
      selectedPricePoolAsset={selectedPricePoolAsset}
      isLoading={isLoading}
      volumeAllTimeData={volumeAllTimeData}
      volumeWeekData={volumeWeekData}
      liquidityAllTimeData={liquidityAllTimeData}
      liquidityWeekData={liquidityWeekData}
      priceRatio={priceRatio}
    />
  )
}
