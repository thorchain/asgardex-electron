import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { useMidgardContext } from '../../contexts/MidgardContext'
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
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { reloadPools },

    reloadNetworkInfo
  } = midgardService

  const refreshHandler = useCallback(() => {
    reloadPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPools])

  const [activeTabKey, setActiveTabKey] = useState('active')

  const tabs = useMemo(
    (): Tab[] => [
      {
        key: 'active',
        label: intl.formatMessage({ id: 'pools.available' }),
        content: <ActivePools refreshHandler={refreshHandler} />
      },
      {
        key: 'pending',
        label: intl.formatMessage({ id: 'pools.pending' }),
        content: <PendingPools refreshHandler={refreshHandler} />
      }
    ],
    [intl, refreshHandler]
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

  useEffect(() => {
    refreshHandler()
  }, [activeTabKey, refreshHandler])

  return (
    <>
      <Styled.TabButtonsContainer>
        <Styled.Tabs renderTabBar={renderTabBar} activeKey={activeTabKey} destroyInactiveTabPane>
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
