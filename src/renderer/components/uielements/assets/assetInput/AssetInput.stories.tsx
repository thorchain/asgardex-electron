import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@xchainjs/xchain-util'

import { AssetInput } from './AssetInput'

storiesOf('Components/Assets/AssetInput', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <AssetInput
        title="swap amount"
        status="slip 2%"
        amount={bn(12345)}
        label="$usd 217.29"
        onChange={(value) => {
          console.log('value ', value.toString())
        }}
      />
    </div>
  )
})
