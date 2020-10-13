import React from 'react'

import * as Styled from './PoolShareCard.style'

type Props = {
  title: string
}

const PoolShareCard: React.FC<Props> = ({ title, children }) => {
  return (
    <Styled.ComponentWrapper>
      <Styled.TitleWrapper>
        <Styled.Title>{title}</Styled.Title>
      </Styled.TitleWrapper>
      <Styled.ContentWrapper>{children}</Styled.ContentWrapper>
    </Styled.ComponentWrapper>
  )
}

export default PoolShareCard
