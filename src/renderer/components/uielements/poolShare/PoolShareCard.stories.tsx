import React from 'react'

import { storiesOf } from '@storybook/react'

import { PoolShareCard } from './PoolShareCard'

storiesOf('Components/PoolShareCard', module).add('default', () => {
  return (
    <PoolShareCard title="Title">
      <p>content</p>
    </PoolShareCard>
  )
})
