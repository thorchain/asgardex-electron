import React from 'react'
import { storiesOf } from '@storybook/react'

import AssetPair from './assetPair'

storiesOf('Components/Assets/AssetPair', module).add('default', () => {
  return (
    <div style={{ display: 'flex' }}>
      <AssetPair from="rune" to="bnb" size="small" />
      <AssetPair from="rune" to="bnb" size="big" />
    </div>
  )
})
