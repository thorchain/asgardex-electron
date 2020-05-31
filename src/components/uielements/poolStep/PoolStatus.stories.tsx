import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import PoolStatus from './PoolStatus'

storiesOf('Components/PoolStatus', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
      <PoolStatus asset="RUNE" target="TOMOB" trend={bn(2.66)} amount={bn(12000)} label="DEPTH" />
    </div>
  )
})
