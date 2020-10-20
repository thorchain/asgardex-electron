import React from 'react'

import * as Styled from './PoolShareCard.style'

type Props = {
  title: string
}

export const PoolShareCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Styled.Wrapper>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Content>{children}</Styled.Content>
    </Styled.Wrapper>
  )
}
