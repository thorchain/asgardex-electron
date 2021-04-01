import React, { useMemo, useState } from 'react'

import { baseAmount, baseToAsset, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import Chart from '../uielements/chart'
import { ChartData, ChartDetail, ChartValues } from '../uielements/chart/types'
import * as Styled from './PoolChart.style'
import { LiquidityData, VolumeData } from './types'

export type Props = {
  isLoading?: boolean
  volumeAllTimeData: O.Option<VolumeData[]>
  volumeWeekData: O.Option<VolumeData[]>
  liquidityAllTimeData: O.Option<LiquidityData[]>
  liquidityWeekData: O.Option<LiquidityData[]>
  priceRatio: BigNumber
}

export const PoolChart: React.FC<Props> = ({
  isLoading,
  volumeAllTimeData: oVolumeAllTimeData,
  volumeWeekData: oVolumeWeekData,
  liquidityAllTimeData: oLiquidityAllTimeData,
  liquidityWeekData: oLiquidityWeekData,
  priceRatio
}) => {
  const [selectedChart, setSelectedChart] = useState('Volume')
  const chartData: ChartData = useMemo(() => {
    const defaultChartValues: ChartValues = {
      allTime: [],
      week: []
    }
    if (isLoading) {
      return {
        Liquidity: {
          values: defaultChartValues,
          loading: true
        },
        Volume: {
          values: defaultChartValues,
          loading: true
        }
      }
    }

    const volumeAllTimeData = FP.pipe(
      oVolumeAllTimeData,
      O.getOrElse(() => [] as VolumeData[])
    )

    const liquidityAllTimeData = FP.pipe(
      oLiquidityAllTimeData,
      O.getOrElse(() => [] as LiquidityData[])
    )

    const volumeWeekData = FP.pipe(
      oVolumeWeekData,
      O.getOrElse(() => [] as VolumeData[])
    )

    const liquidityWeekData = FP.pipe(
      oLiquidityWeekData,
      O.getOrElse(() => [] as LiquidityData[])
    )

    const volumeSeriesDataAT: ChartDetail[] = []
    const liquiditySeriesDataAT: ChartDetail[] = []

    volumeAllTimeData.forEach((data) => {
      const time = data.time
      const volumeData = {
        time,
        value: baseToAsset(baseAmount(bnOrZero(data.poolVolume).multipliedBy(priceRatio)))
          .amount()
          .toFixed(3)
      }
      volumeSeriesDataAT.push(volumeData)
    })

    liquidityAllTimeData.forEach((data) => {
      const time = data.time
      const liquidityData = {
        time,
        value: baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(2).multipliedBy(priceRatio)))
          .amount()
          .toFixed(3)
      }
      liquiditySeriesDataAT.push(liquidityData)
    })

    const volumeSeriesDataWeek: ChartDetail[] = []
    const liquiditySeriesDataWeek: ChartDetail[] = []

    volumeWeekData.forEach((data) => {
      // const time = data?.time ?? 0
      const time = data.time
      const volumeData = {
        time,
        value: baseToAsset(baseAmount(bnOrZero(data.poolVolume).multipliedBy(priceRatio)))
          .amount()
          .toFixed(3)
      }
      volumeSeriesDataWeek.push(volumeData)
    })

    liquidityWeekData.forEach((data) => {
      // const time = data?.time ?? 0
      const time = data.time
      const liquidityData = {
        time,
        value: baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(2).multipliedBy(priceRatio)))
          .amount()
          .toFixed(3)
      }
      liquiditySeriesDataWeek.push(liquidityData)
    })

    return {
      Liquidity: {
        values: {
          allTime: liquiditySeriesDataAT,
          week: liquiditySeriesDataWeek
        },
        loading: false,
        type: 'line',
        unit: '$'
      },
      Volume: {
        values: {
          allTime: volumeSeriesDataAT,
          week: volumeSeriesDataWeek
        },
        loading: false,
        type: 'bar',
        unit: '$'
      }
    }
  }, [isLoading, oLiquidityAllTimeData, oLiquidityWeekData, oVolumeAllTimeData, oVolumeWeekData, priceRatio])

  return (
    <Styled.Container>
      <Chart
        chartIndexes={['Liquidity', 'Volume']}
        chartData={chartData}
        selectedIndex={selectedChart}
        selectChart={setSelectedChart}
      />
    </Styled.Container>
  )
}
