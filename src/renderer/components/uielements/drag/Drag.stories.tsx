/* eslint-disable no-alert */
import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { Drag } from './Drag'

storiesOf('Components/Drag', module)
  .add('default', () => {
    return (
      <div style={{ padding: '20px' }}>
        <Drag source={AssetBNB} target={AssetRuneNative} title="Drag to swap" onConfirm={() => alert('Confirmed!')} />
      </div>
    )
  })
  .add('Empty assets', () => (
    <div style={{ padding: '20px' }}>
      <Drag title="Drag to swap" onConfirm={() => alert('Confirmed!')} />
    </div>
  ))
