import React from 'react'

import * as Styled from './PoolTitle.style'

export type Props = {
  isLoading?: boolean
}

export const PoolTitle: React.FC<Props> = ({ isLoading }) => {
  return <Styled.Container>{isLoading ? 'Loading ...' : 'Pool title here'}</Styled.Container>
}
