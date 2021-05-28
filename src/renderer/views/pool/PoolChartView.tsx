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
import { ChartDetailsRD, ChartTimeFrame } from '../../components/uielements/chart/types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import {
  GetDepthHistoryIntervalEnum,
  GetLiquidityHistoryIntervalEnum,
  GetSwapHistoryIntervalEnum
} from '../../types/generated/midgard'
import {
  getLiquidityFromHistoryItems,
  getVolumeFromHistoryItems,
  getEoDTime,
  getWeekAgoTime
} from './PoolChartView.helper'

type Props = {
  priceRatio: BigNumber
}

export const PoolChartView: React.FC<Props> = ({ priceRatio }) => {
  const {
    service: {
      pools: { selectedPricePoolAsset$, getSwapHistory$, getDepthHistory$, getPoolLiquidityHistory$ }
    }
  } = useMidgardContext()

  const selectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)
  const unit = FP.pipe(
    selectedPricePoolAsset,
    O.fold(() => '', currencySymbolByAsset)
  )

  type DataRequestParams = { timeFrame: ChartTimeFrame; dataType: string }
  const savedParams = useRef<DataRequestParams>({
    timeFrame: 'allTime',
    dataType: 'Liquidity'
  })

  const curTime = getEoDTime()
  const weekAgoTime = getWeekAgoTime()
  const [chartDataRD, updateChartData] = useObservableState<ChartDetailsRD, Partial<DataRequestParams>>(
    (params$) =>
      FP.pipe(
        params$,
        RxOp.startWith(savedParams),
        RxOp.map((params) => (savedParams.current = { ...savedParams.current, ...params })),
        RxOp.switchMap((params) => {
          const requestParams = params.timeFrame === 'week' ? { from: weekAgoTime, to: curTime } : {}
          return params.dataType === 'Liquidity'
            ? getDepthHistory$({
                ...requestParams,
                interval: GetDepthHistoryIntervalEnum.Day
              }).pipe(liveData.map(({ intervals }) => getLiquidityFromHistoryItems(intervals)))
            : Rx.combineLatest([
                getSwapHistory$({
                  ...requestParams,
                  interval: GetSwapHistoryIntervalEnum.Day
                }),
                getPoolLiquidityHistory$({
                  ...requestParams,
                  interval: GetLiquidityHistoryIntervalEnum.Day
                })
              ]).pipe(
                RxOp.map(([swapHistoryRD, liquidityHistoryRD]) => sequenceTRD(swapHistoryRD, liquidityHistoryRD)),

                liveData.map(([swapHistory, _liquidityHistory]) =>
                  getVolumeFromHistoryItems({
                    swapHistory: swapHistory.intervals,
                    liquidityHistory: _liquidityHistory.intervals
                  })
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
    (dataType: string) => {
      updateChartData({ dataType })
    },
    [updateChartData]
  )

  return (
    <PoolDetailsChart
      dataTypes={['Liquidity', 'Volume']}
      selectedDataType={savedParams.current.dataType}
      setDataType={setDataTypeCallback}
      chartDetails={chartDataRDPriced}
      chartType={savedParams.current.dataType === 'Liquidity' ? 'line' : 'bar'}
      unit={unit}
      selectedTimeFrame={savedParams.current.timeFrame}
      setTimeFrame={setTimeFrameCallback}
    />
  )
}
