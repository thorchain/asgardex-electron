import React, { useCallback, useMemo, useRef } from 'react'

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
import {
  GetDepthHistoryIntervalEnum,
  GetLiquidityHistoryIntervalEnum,
  GetSwapHistoryIntervalEnum
} from '../../types/generated/midgard'
import { getLiquidityFromHistoryItems, getVolumeFromHistoryItems } from './PoolChartView.helper'

export type Props = {
  priceRatio: BigNumber
}

export const PoolChartView: React.FC<Props> = ({ priceRatio }) => {
  const {
    service: {
      pools: {
        selectedPricePoolAsset$,
        getSelectedPoolSwapHistory$,
        reloadSwapHistory,
        getDepthHistory$,
        reloadDepthHistory,
        getPoolLiquidityHistory$,
        reloadLiquidityHistory
      }
    }
  } = useMidgardContext()

  const reloadData = useCallback(() => {
    reloadDepthHistory()
    reloadSwapHistory()
    reloadLiquidityHistory()
  }, [reloadDepthHistory, reloadLiquidityHistory, reloadSwapHistory])

  const selectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)
  const unit = FP.pipe(
    selectedPricePoolAsset,
    O.fold(() => '', currencySymbolByAsset)
  )

  type DataRequestParams = { timeFrame: ChartTimeFrame; dataType: ChartDataType }
  const savedParams = useRef<DataRequestParams>({
    timeFrame: 'allTime',
    dataType: 'liquidity'
  })

  const [chartDataRD, updateChartData] = useObservableState<ChartDetailsRD, Partial<DataRequestParams>>(
    (params$) =>
      FP.pipe(
        params$,
        RxOp.startWith(savedParams),
        RxOp.map((params) => (savedParams.current = { ...savedParams.current, ...params })),
        RxOp.switchMap((params) => {
          const requestParams = params.timeFrame === 'week' ? { count: 7 } : {}
          return Rx.iif(
            () => params.dataType === 'liquidity',
            // (1) get data for depth history
            getDepthHistory$({
              ...requestParams,
              interval: GetDepthHistoryIntervalEnum.Day
            }).pipe(liveData.map(({ intervals }) => getLiquidityFromHistoryItems(intervals))),
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
              )
            )
          )
        })
      ),
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

  return (
    <PoolDetailsChart
      dataTypes={['liquidity', 'volume']}
      selectedDataType={savedParams.current.dataType}
      reloadData={reloadData}
      setDataType={setDataTypeCallback}
      chartDetails={chartDataRDPriced}
      chartType={savedParams.current.dataType === 'liquidity' ? 'line' : 'bar'}
      unit={unit}
      selectedTimeFrame={savedParams.current.timeFrame}
      setTimeFrame={setTimeFrameCallback}
    />
  )
}
