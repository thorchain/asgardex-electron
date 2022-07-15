import { useState } from 'react'

import { ComponentMeta } from '@storybook/react'

import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter as FilterType } from './types'

const Template = () => {
  const [filter, setFilter] = useState<FilterType>('ALL')
  return (
    <PoolActionsHistoryFilter
      currentFilter={filter}
      onFilterChanged={setFilter}
      availableFilters={['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']}
    />
  )
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/PoolActionsHistoryFilter'
}

export default meta
