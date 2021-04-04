import React, { useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, baseToAsset, bnOrZero, currencySymbolByAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import Chart from '../../components/uielements/chart'
import { ChartDetail, ChartTimeFrame } from '../../components/uielements/chart/types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import {
  DepthHistoryItem,
  GetDepthHistoryIntervalEnum,
  GetSwapHistoryIntervalEnum,
  SwapHistoryItem
} from '../../types/generated/midgard'
import { getEoDTime, getWeekAgoTime } from './PoolChartView.helper'

type Props = {
  priceRatio: BigNumber
}

export const PoolChartView: React.FC<Props> = ({ priceRatio }) => {
  const {
    service: {
      pools: { selectedPricePoolAsset$, getSwapHistory$, getDepthHistory$ }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartDataRD, updateChartData] = useObservableState<RD.RemoteData<any, any>, Partial<DataRequestParams>>(
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
              })
            : getSwapHistory$({
                ...requestParams,
                interval: GetSwapHistoryIntervalEnum.Day
              })
        })
      ),
    RD.initial
  )

  const chartValues = FP.pipe(
    chartDataRD,
    RD.fold(
      () => [] as ChartDetail[],
      () => [] as ChartDetail[],
      () => [] as ChartDetail[],
      (history) => {
        if (savedParams.current.dataType === 'Liquidity') {
          const intervals = history.intervals as DepthHistoryItem[]
          return intervals.map((interval) => ({
            time: Number(interval.startTime),
            value: baseToAsset(baseAmount(bnOrZero(interval.runeDepth).multipliedBy(2).multipliedBy(priceRatio)))
              .amount()
              .toFixed(3)
          }))
        } else {
          const intervals = history.intervals as SwapHistoryItem[]
          return intervals.map((interval) => ({
            time: Number(interval.startTime),
            value: baseToAsset(baseAmount(bnOrZero(interval.totalVolume).multipliedBy(priceRatio)))
              .amount()
              .toFixed(3)
          }))
        }
      }
    )
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
    <Chart
      dataTypes={['Liquidity', 'Volume']}
      selectedDataType={savedParams.current.dataType}
      setDataType={setDataTypeCallback}
      chartValues={chartValues}
      isLoading={RD.isPending(chartDataRD)}
      chartType={savedParams.current.dataType === 'Liquidity' ? 'line' : 'bar'}
      unit={unit}
      selectedTimeFrame={savedParams.current.timeFrame}
      setTimeFrame={setTimeFrameCallback}
    />
  )
}
