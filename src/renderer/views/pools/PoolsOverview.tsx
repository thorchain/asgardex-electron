import React, { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Tabs } from '../../components/tabs/Tabs'
import { ActivePools } from './ActivePools'
import { PendingPools } from './PendingPools'

type TabKey = 'active' | 'pending'

type Tab = {
  key: TabKey
  label: string
  content: JSX.Element
}

export const PoolsOverview: React.FC = (): JSX.Element => {
  const intl = useIntl()

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

  return (
    <div>
      <Tabs destroyInactiveTabPane tabs={tabs} centered={false} defaultActiveKey="active" />
    </div>
  )
}
