import React from 'react'

import * as Styled from './PoolShareCard.style'

type Props = {
  title: string
}

const PoolShareCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Styled.Wrapper>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Content>{children}</Styled.Content>
    </Styled.Wrapper>
  )
}

export default PoolShareCard
