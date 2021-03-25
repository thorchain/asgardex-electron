import React from 'react'

import * as Styled from './PoolHistory.style'

export type Props = {
  isLoading?: boolean
}

export const PoolHistory: React.FC<Props> = ({ isLoading }) => {
  return <Styled.Container>{isLoading ? 'Loading ...' : 'Pool history here'}</Styled.Container>
}
