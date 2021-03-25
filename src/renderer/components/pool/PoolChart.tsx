import React from 'react'

import * as Styled from './PoolChart.style'

export type Props = {
  isLoading?: boolean
}

export const PoolChart: React.FC<Props> = ({ isLoading }) => {
  return <Styled.Container>{isLoading ? 'Loading ...' : 'Pool chart here'}</Styled.Container>
}
