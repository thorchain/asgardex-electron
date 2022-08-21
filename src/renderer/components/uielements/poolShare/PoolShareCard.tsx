import React from 'react'

import * as Styled from './PoolShareCard.styles'

export type Props = {
  title: string
  children: React.ReactNode
}

export const PoolShareCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Styled.Wrapper>
      <Styled.Title>{title}</Styled.Title>
      <Styled.Content>{children}</Styled.Content>
    </Styled.Wrapper>
  )
}
