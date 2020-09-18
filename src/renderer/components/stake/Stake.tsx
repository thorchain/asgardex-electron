import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import * as Styled from './Stake.styles'

type Props = {
  shareContent: React.ReactNode
  topContent: React.ReactNode
  AddStake: React.ComponentType
}

export const Stake: React.FC<Props> = ({ shareContent, topContent, AddStake }) => {
  const intl = useIntl()

  const tabs = useMemo(
    () => [
      { label: intl.formatMessage({ id: 'common.add' }), key: 'add', content: <AddStake /> },
      { label: intl.formatMessage({ id: 'stake.withdraw' }), key: 'withdraw', content: 'withdraw' }
    ],
    [intl]
  )

  const extra = useMemo(
    () => (
      <Styled.AdvancedButton color="primary" typevalue="outline">
        {intl.formatMessage({ id: 'stake.advancedMode' })}
      </Styled.AdvancedButton>
    ),
    [intl]
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
