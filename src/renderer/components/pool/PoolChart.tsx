import React, { useMemo, useState } from 'react'

import { LiquidityHistoryItem } from '../../types/generated/midgard'
import Chart from '../uielements/chart'
import { ChartData, ChartDetail, ChartValues } from '../uielements/chart/types'
import * as Styled from './PoolChart.style'

export type Props = {
  isLoading?: boolean
  allTimeData: LiquidityHistoryItem[]
  weekData: LiquidityHistoryItem[]
}

export const PoolChart: React.FC<Props> = ({ isLoading, allTimeData, weekData }) => {
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

    const volumeSeriesDataAT: ChartDetail[] = []
    const liquiditySeriesDataAT: ChartDetail[] = []

    allTimeData.forEach((data) => {
      const time = data.endTime
      const volumeData = {
        time,
        value: getUSDPrice(bnOrZero(data.poolVolume))
      }
      const liquidityData = {
        time,
        value: getUSDPrice(bnOrZero(data?.runeDepth).multipliedBy(2))
      }

      volumeSeriesDataAT.push(volumeData)
      liquiditySeriesDataAT.push(liquidityData)
    })

    const volumeSeriesDataWeek: ChartDetail[] = []
    const liquiditySeriesDataWeek: ChartDetail[] = []

    weekData.forEach((data) => {
      const time = data?.time ?? 0
      const volumeData = {
        time,
        value: getUSDPrice(bnOrZero(data?.poolVolume))
      }
      const liquidityData = {
        time,
        value: getUSDPrice(bnOrZero(data?.runeDepth).multipliedBy(2))
      }

      volumeSeriesDataWeek.push(volumeData)
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
  }, [isLoading, allTimeData, weekData])

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
