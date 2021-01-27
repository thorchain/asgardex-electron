import React, { useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import * as Styled from './Interact.styles'

type Props = {
  bondContent: JSX.Element
  unbondContent: JSX.Element
  leaveContent: JSX.Element
}

export const Interact: React.FC<Props> = ({ bondContent, unbondContent, leaveContent }) => {
  const intl = useIntl()

  const tabs = useMemo(
    () => [
      {
        key: 'bond',
        label: intl.formatMessage({ id: 'deposit.interact.actions.bond' }),
        content: bondContent
      },
      {
        key: 'unbond',
        label: intl.formatMessage({ id: 'deposit.interact.actions.unbond' }),
        content: unbondContent
      },
      {
        key: 'leave',
        label: intl.formatMessage({ id: 'deposit.interact.actions.leave' }),
        content: leaveContent
      }
    ],
    [intl, bondContent, unbondContent, leaveContent]
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
          renderTabBar={() => (
            <Styled.TabButtonsContainer>
              {tabs.map((tab) => (
                <Styled.TabButton
                  isActive={tab.key === activeTabKey}
                  key={tab.key}
                  onClick={() => setActiveTabKey(tab.key)}>
                  {tab.label}
                </Styled.TabButton>
              ))}
            </Styled.TabButtonsContainer>
          )}>
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
