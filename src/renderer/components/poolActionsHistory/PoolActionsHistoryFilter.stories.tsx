import React, { useState } from 'react'

import { Story } from '@storybook/react'

import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter as FilterType } from './types'

export const Filter: Story = () => {
  const [filter, setFilter] = useState<FilterType>('ALL')
  return (
    <PoolActionsHistoryFilter
      currentFilter={filter}
      onFilterChanged={setFilter}
      availableFilters={['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']}
    />
  )
}

export default {
  title: 'Components/PoolActionsHistoryFilter',
  component: PoolActionsHistoryFilter
}
