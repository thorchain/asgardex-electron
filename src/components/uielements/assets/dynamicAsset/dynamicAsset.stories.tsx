import React from 'react'

import { storiesOf } from '@storybook/react'

import DynamicAsset from './dynamicAsset'

storiesOf('Components/Coins/DynamicAsset', module).add('default', () => {
  return (
    <div style={{ display: 'flex' }}>
      <DynamicAsset type="bnb" size="big" />
      <DynamicAsset type="bolt" size="big" />
      <DynamicAsset type="rune" size="big" />
      <DynamicAsset type="ankr" size="big" />
      <DynamicAsset type="ftm" size="big" />
      <DynamicAsset type="tomo" size="big" />
      <DynamicAsset type="loki" size="big" />
      <DynamicAsset type="loki" size="normal" />
      <DynamicAsset type="loki" size="small" />
    </div>
  )
})
