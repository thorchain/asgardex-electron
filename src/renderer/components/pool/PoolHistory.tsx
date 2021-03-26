import React from 'react'

import * as A from 'antd'

import * as Styled from './PoolHistory.style'

export type Props = {
  isLoading?: boolean
}

export const PoolHistory: React.FC<Props> = () => {
  return (
    <Styled.Container>
      <A.Spin />
    </Styled.Container>
  )
}
