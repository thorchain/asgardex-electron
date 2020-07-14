import React from 'react'

import { storiesOf } from '@storybook/react'

import BackLink from './BackLink'

storiesOf('Components/BackLink', module).add('default', () => {
  return (
    <div style={{ padding: '15px' }}>
      <BackLink />
    </div>
  )
})
