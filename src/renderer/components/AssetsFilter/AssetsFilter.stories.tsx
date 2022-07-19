import { useState } from 'react'

import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/Option'

import { PoolFilter, DEFAULT_POOL_FILTERS } from '../../services/midgard/types'
import { AssetsFilter as Component } from './AssetsFilter'

const Template: StoryFn = () => {
  const [filter, setFilter] = useState<O.Option<PoolFilter>>(O.none)

  return <Component setFilter={setFilter} activeFilter={filter} poolFilters={DEFAULT_POOL_FILTERS} />
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/AssetsFilter'
}

export default meta
