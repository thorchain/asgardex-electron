import React from 'react'

import Chart from '../uielements/chart'
import * as Styled from './PoolChart.style'

export type Props = {
  isLoading?: boolean
}

export const PoolChart: React.FC<Props> = () => {
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
