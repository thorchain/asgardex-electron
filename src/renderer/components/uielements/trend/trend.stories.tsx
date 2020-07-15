import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import Trend from './trend'

storiesOf('Components/Trend', module).add('default', () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '300px'
      }}>
      <Trend amount={bn(0.2)} />
      <Trend amount={bn(-1.5)} />
    </div>
  )
})
