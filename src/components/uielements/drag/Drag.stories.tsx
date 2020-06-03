/* eslint-disable no-alert */
import React from 'react'

import { storiesOf } from '@storybook/react'

import Drag from './Drag'

storiesOf('Components/Drag', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <Drag source="bnb" target="rune" title="Drag to swap" onConfirm={() => alert('Confirmed!')} />

      <Drag source="blue" target="confirm" title="Drag to confirm" onConfirm={() => alert('Confirmed!')} />
    </div>
  )
})
