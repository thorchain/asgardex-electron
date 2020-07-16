import React from 'react'

import { storiesOf } from '@storybook/react'

import Selection from './Selection'

storiesOf('Components/Selection', module).add('default', () => {
  return (
    <div>
      <Selection onSelect={() => {}} selected={0} />
      <Selection onSelect={() => {}} selected={0} />
    </div>
  )
})
