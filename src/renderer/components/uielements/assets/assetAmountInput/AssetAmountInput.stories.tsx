import React, { useCallback } from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetAmount } from '@thorchain/asgardex-util'

import AssetAmountInput from './AssetAmountInput'

storiesOf('Components/Assets/AssetAmountInput', module)
  .add('default', () => {
    const [value, setValue] = React.useState<AssetAmount>(assetAmount('1002.34'))

    const handleChange = useCallback((v) => {
      console.log('value ', v.amount().toString())
      setValue(v)
    }, [])

    return (
      <div style={{ padding: '20px' }}>
        <AssetAmountInput amount={value} onChange={handleChange} />
      </div>
    )
  })
  .add('no value', () => {
    return (
      <div style={{ padding: '20px' }}>
        <AssetAmountInput
          onChange={(value) => {
            console.log('value ', value.amount().toString())
          }}
        />
      </div>
    )
  })
