/* eslint-disable no-alert */
import React from 'react'

import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import Drag from './Drag'

storiesOf('Components/Drag', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <Drag
        source={ASSETS_MAINNET.BNB}
        target={ASSETS_MAINNET.RUNE}
        title="Drag to swap"
        onConfirm={() => alert('Confirmed!')}
      />
    </div>
  )
})
