import { useState } from 'react'

import { ComponentMeta } from '@storybook/react'
import * as O from 'fp-ts/Option'

import { PoolFilter, DEFAULT_POOL_FILTERS } from '../../services/midgard/types'
import { AssetsFilter } from './AssetsFilter'

const Template = () => {
  const [filter, setFilter] = useState<O.Option<PoolFilter>>(O.none)

  return <AssetsFilter setFilter={setFilter} activeFilter={filter} poolFilters={DEFAULT_POOL_FILTERS} />
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'AssetsFilter'
}

export default meta
