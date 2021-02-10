import React, { useCallback, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { ActivePools } from './ActivePools'
import { PendingPools } from './PendingPools'
import * as Styled from './PoolsOverview.style'

type TabKey = 'active' | 'pending'

type Tab = {
  key: TabKey
  label: string
  content: JSX.Element
}

export const PoolsOverview: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const [activeTabKey, setActiveTabKey] = useState('active')

  const tabs = useMemo(
    (): Tab[] => [
      {
        key: 'active',
        label: intl.formatMessage({ id: 'pools.available' }),
        content: <ActivePools />
      },
      {
        key: 'pending',
        label: intl.formatMessage({ id: 'pools.pending' }),
        content: <PendingPools />
      }
    ],
    [intl]
  )

  const renderTabBar = useCallback(
    () => (
      <Styled.TabButtonsContainer>
        {tabs.map(({ key, label }) => (
          <Styled.TabButton key={key} selected={key === activeTabKey} onClick={() => setActiveTabKey(key)}>
            {label}
          </Styled.TabButton>
        ))}
      </Styled.TabButtonsContainer>
    ),
    [activeTabKey, tabs]
  )

  return (
    <>
      <Styled.TabButtonsContainer>
        <Styled.Tabs renderTabBar={renderTabBar} activeKey={activeTabKey}>
          {tabs.map(({ key, label, content }) => (
            <Styled.TabPane tab={label} key={key}>
              {content}
            </Styled.TabPane>
          ))}
        </Styled.Tabs>
      </Styled.TabButtonsContainer>
    </>
  )
}
