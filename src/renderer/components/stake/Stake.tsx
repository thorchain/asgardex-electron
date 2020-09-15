import React from 'react'

import * as Styled from './Stake.styles'

type Props = {
  shareContent: React.ReactNode
  topContent: React.ReactNode
}

export const Stake: React.FC<Props> = ({ shareContent, topContent }) => {
  const tabs = [
    { label: 'add', key: 'add', content: 'add' },
    { label: 'withdraw', key: 'withdraw', content: 'withdraw' }
  ]

  const extra = (
    <Styled.AdvancedButton color="primary" typevalue="outline">
      advanced mode
    </Styled.AdvancedButton>
  )

  return (
    <Styled.Container>
      <Styled.TopContainer>{topContent}</Styled.TopContainer>
      <Styled.ContentContainer>
        <Styled.TotalContainer>{shareContent}</Styled.TotalContainer>
        <Styled.StakeContentContainer>
          <Styled.Tabs tabs={tabs} centered={false} tabBarExtraContent={extra} />
        </Styled.StakeContentContainer>
      </Styled.ContentContainer>
    </Styled.Container>
  )
}
