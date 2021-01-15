import React, { useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import * as Styled from './DepositActions.styles'

type Props = {}

export const DepositActions: React.FC<Props> = () => {
  const intl = useIntl()

  const tabs = useMemo(
    () => [
      {
        key: 'bond',
        label: 'bond',
        content: <div>bond content</div>
      },
      {
        key: 'unbond',
        label: 'unbond',
        content: <div>unbond content</div>
      },
      {
        key: 'leave',
        label: 'leave',
        content: <div>leave content</div>
      }
    ],
    []
  )

  const [activeTabKey, setActiveTabKey] = useState(tabs[0].key)

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.AssetIcon />
        <div>
          <Styled.HeaderTitle>{intl.formatMessage({ id: 'deposit.interact.title' })}</Styled.HeaderTitle>
          <Styled.HeaderSubtitle>{intl.formatMessage({ id: 'deposit.interact.subtitle' })}</Styled.HeaderSubtitle>
        </div>
      </Styled.Header>
      <Styled.FormWrapper>
        <Styled.FormTitle>{intl.formatMessage({ id: 'deposit.interact.actions' })}</Styled.FormTitle>
        <Styled.Tabs
          activeKey={activeTabKey}
          renderTabBar={(_props) => {
            console.log(_props)
            return (
              <Styled.TabButtonsContainer>
                {tabs.map((tab) => (
                  <Styled.TabButton key={tab.key} onClick={() => setActiveTabKey(tab.key)}>
                    {tab.label}
                  </Styled.TabButton>
                ))}
              </Styled.TabButtonsContainer>
            )
          }}>
          {tabs.map((tab) => (
            <Styled.TabPane tab={tab.label} key={tab.key}>
              {tab.content}
            </Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.FormWrapper>
    </Styled.Container>
  )
}
