import React from 'react'

import { storiesOf } from '@storybook/react'

import { StepBar } from './index'

storiesOf('Components/StepBar', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <StepBar />
    </div>
  )
})
