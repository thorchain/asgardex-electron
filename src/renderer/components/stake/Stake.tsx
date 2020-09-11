import React from 'react'

import * as Styled from './Stake.styles'

export const Stake: React.FC = () => {
  return (
    <Styled.Container>
      <Styled.TopContainer>TopContainer</Styled.TopContainer>
      <Styled.ContentContainer>
        <Styled.TotalContainer>TotalContainer</Styled.TotalContainer>
        <Styled.StakeContentContainer>StakeContentContainer</Styled.StakeContentContainer>
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
