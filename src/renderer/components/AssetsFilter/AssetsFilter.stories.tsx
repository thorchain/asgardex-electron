import { useState } from 'react'

import { Story } from '@storybook/react'
import * as O from 'fp-ts/Option'

import { PoolFilter, DEFAULT_POOL_FILTERS } from '../../services/midgard/types'
import { AssetsFilter } from './AssetsFilter'

export const Default: Story = () => {
  const [filter, setFilter] = useState<O.Option<PoolFilter>>(O.none)

  return <AssetsFilter setFilter={setFilter} activeFilter={filter} poolFilters={DEFAULT_POOL_FILTERS} />
}

export default {
  component: AssetsFilter,
  title: 'AssetsFilter'
}
