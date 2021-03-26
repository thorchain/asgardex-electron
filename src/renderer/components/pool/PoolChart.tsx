import React from 'react'

import * as A from 'antd'

import * as Styled from './PoolChart.style'

export type Props = {
  isLoading?: boolean
}

export const PoolChart: React.FC<Props> = () => {
  return (
    <Styled.Container>
      <A.Spin />
    </Styled.Container>
  )
}
