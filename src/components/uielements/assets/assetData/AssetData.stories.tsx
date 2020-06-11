import React from 'react'

import { storiesOf } from '@storybook/react'

import AssetData from './AssetData'

const priceUnit = 'RUNE'

storiesOf('Components/Assets/AssetData', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <AssetData asset="bnb" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
      <AssetData asset="ftm" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
      <AssetData asset="rune" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
      <AssetData asset="ankr" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
      <AssetData asset="bolt" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
      <AssetData asset="tomo" assetValue={2.49274} priceValue="217.92" priceUnit={priceUnit} />
    </div>
  )
})
