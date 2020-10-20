import React from 'react'

import { storiesOf } from '@storybook/react'

import { Status } from './index'

storiesOf('Components/Status', module).add('default', () => {
  return (
    <div>
      <Status title="pool" value="bnb:bolt" />
      <Status loading />
      <Status title="pool2" value="bnb:bolt" direction="horizontal" />
      <Status loading direction="horizontal" />
    </div>
  )
})
