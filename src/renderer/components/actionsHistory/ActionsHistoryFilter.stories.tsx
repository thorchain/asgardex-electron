import React, { useState } from 'react'

import { Story } from '@storybook/react'

import { ActionsHistoryFilter } from './ActionsHistoryFilter'
import { Filter as FilterType } from './types'

export const Filter: Story = () => {
  const [filter, setFilter] = useState<FilterType>('ALL')
  return <ActionsHistoryFilter currentFilter={filter} onFilterChanged={setFilter} />
}

export default {
  title: 'ActionsHistory',
  component: ActionsHistoryFilter
}
