import React from 'react'

import { storiesOf } from '@storybook/react'
import { tokenAmount } from '@thorchain/asgardex-token'

import AssetInput from './assetInput'

storiesOf('Components/Tokens/TokenInput', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <AssetInput
        title="swap amount"
        status="slip 2%"
        amount={tokenAmount(12345).amount()}
        label="$usd 217.29"
        onChange={(value) => {
          console.log('value ', value.toString())
        }}
      />
    </div>
  )
})
