import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { currencySymbolByAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { PoolDetailsChart } from '../../components/uielements/chart'
import { ChartDataType, ChartDetailsRD, ChartTimeFrame } from '../../components/uielements/chart/PoolDetailsChart.types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { liveData } from '../../helpers/rx/liveData'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import { GetLiquidityHistoryIntervalEnum, GetSwapHistoryIntervalEnum } from '../../types/generated/midgard'
import {
  getCachedChartData,
  getDepthHistoryParams,
  getLiquidityFromHistoryItems,
  getVolumeFromHistoryItems,
  INITIAL_CACHED_CHART_DATA,
  updateCachedChartData
} from './PoolChartView.helper'
import { CachedChartData } from './PoolChartView.types'

export type Props = {
  priceRatio: BigNumber
}

export const PoolChartView: React.FC<Props> = ({ priceRatio }) => {
  const {
    service: {
      reloadChartDataUI$,
      pools: { selectedPricePoolAsset$, getSelectedPoolSwapHistory$, getDepthHistory$, getPoolLiquidityHistory$ }
    }
  } = useMidgardContext()

  type DataRequestParams = { timeFrame: ChartTimeFrame; dataType: ChartDataType }
  const savedParams = useRef<DataRequestParams>({
    timeFrame: 'week',
    dataType: 'liquidity'
  })

  const cachedData = useRef<CachedChartData>(INITIAL_CACHED_CHART_DATA)

  const selectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)
  const unit = FP.pipe(
    selectedPricePoolAsset,
    O.fold(() => '', currencySymbolByAsset)
  )

  const [chartDataRD, updateChartData] = useObservableState<ChartDetailsRD, Partial<DataRequestParams>>(
    (partialUpdatedParams$) => {
      return FP.pipe(
        partialUpdatedParams$,
        // In case no partialUpdatedParams is set, start with initial data
        RxOp.startWith(savedParams.current),
        // update savedParams
        RxOp.map((partialUpdatedParams) => {
          savedParams.current = { ...savedParams.current, ...partialUpdatedParams }
          return savedParams.current
        }),
        RxOp.switchMap(({ dataType, timeFrame }) =>
          FP.pipe(
            // get cached data
            getCachedChartData({ cache: cachedData.current, timeFrame, dataType }),
            O.fold(
              // request new data if no cache data
              () => {
                const requestParams = getDepthHistoryParams(timeFrame)
                return Rx.iif(
                  () => dataType === 'liquidity',
                  // (1) get data for depth history
                  getDepthHistory$(requestParams).pipe(
                    liveData.map(({ intervals }) => getLiquidityFromHistoryItems(intervals)),
                    // cache data
                    liveData.map((data) => {
                      cachedData.current = updateCachedChartData({
                        dataType,
                        timeFrame,
                        cache: cachedData.current,
                        data: O.some(data)
                      })
                      return data
                    })
                  ),
                  // (2) or get data for volume history
                  FP.pipe(
                    liveData.sequenceS({
                      swapHistory: getSelectedPoolSwapHistory$({
                        ...requestParams,
                        interval: GetSwapHistoryIntervalEnum.Day
                      }),
                      liquidityHistory: getPoolLiquidityHistory$({
                        ...requestParams,
                        interval: GetLiquidityHistoryIntervalEnum.Day
                      })
                    }),
                    liveData.map(({ swapHistory, liquidityHistory }) =>
                      getVolumeFromHistoryItems({
                        swapHistory: swapHistory.intervals,
                        liquidityHistory: liquidityHistory.intervals
                      })
                    ),
                    // cache data
                    liveData.map((data) => {
                      cachedData.current = updateCachedChartData({
                        dataType,
                        timeFrame,
                        cache: cachedData.current,
                        data: O.some(data)
                      })
                      return data
                    })
                  )
                )
              },
              // return cached data if available
              (chartDetails) => {
                // Note: Chart does need a delay to render everything properly
                return FP.pipe(
                  Rx.of(RD.pending),
                  RxOp.delay(300),
                  RxOp.switchMap((_) => Rx.of(RD.success(chartDetails))),
                  // Initial value is needed to show `pending` at UI before `delay`
                  RxOp.startWith(RD.pending)
                )
              }
            )
          )
        )
      )
    },
    RD.initial
  )

  const chartDataRDPriced: ChartDetailsRD = useMemo(
    () =>
      FP.pipe(
        chartDataRD,
        RD.map(FP.flow(A.map((detail) => ({ ...detail, amount: detail.amount.times(priceRatio) }))))
      ),
    [chartDataRD, priceRatio]
  )

  const setTimeFrameCallback = useCallback(
    (timeFrame: ChartTimeFrame) => {
      updateChartData({ timeFrame })
    },
    [updateChartData]
  )

  const setDataTypeCallback = useCallback(
    (dataType: ChartDataType) => {
      updateChartData({ dataType })
    },
    [updateChartData]
  )

  // Reloading data means asking for "fresh" data - no data is used from cache
  const reloadData = useCallback(() => {
    // clear cached data before reloading data
    const { dataType, timeFrame } = savedParams.current
    cachedData.current = updateCachedChartData({
      dataType,
      timeFrame,
      cache: cachedData.current,
      data: O.none
    })
    // re-ask data
    updateChartData({ dataType, timeFrame })
  }, [updateChartData])

  // Listen to re-load trigger events
  const [reloaded] = useObservableState(
    () =>
      reloadChartDataUI$.pipe(
        // Since `reloadChartDataUI$` is a `TriggerStream$` with same value all the time
        // its value needs to be unique to trigger next `useEffect`
        RxOp.map((v) => `${v}-${Date.now()}`)
      ),
    ''
  )

  // Listen to `reloaded` state (see above ^) to ask for "fresh", not cached data
  useEffect(() => {
    if (reloaded) {
      const {
        current: { dataType, timeFrame }
      } = savedParams
      // clear cache of current chart data
      cachedData.current = updateCachedChartData({
        dataType,
        timeFrame,
        cache: cachedData.current,
        data: O.none
      })
      // re-ask data
      updateChartData({ dataType, timeFrame })
    }
  }, [reloadData, reloaded, updateChartData])

  return (
    <PoolDetailsChart
      dataTypes={['liquidity', 'volume']}
      selectedDataType={savedParams.current.dataType}
      reloadData={reloadData}
      setDataType={setDataTypeCallback}
      chartDetails={chartDataRDPriced}
      unit={unit}
      selectedTimeFrame={savedParams.current.timeFrame}
      setTimeFrame={setTimeFrameCallback}
    />
  )
}
