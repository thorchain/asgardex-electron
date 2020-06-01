import React from 'react'

import { storiesOf } from '@storybook/react'

import DynamicCoin from './DynamicCoin'

storiesOf('Components/Coins/DynamicCoin', module).add('default', () => {
  return (
    <div style={{ display: 'flex' }}>
      <DynamicCoin type="bnb" size="big" />
      <DynamicCoin type="bolt" size="big" />
      <DynamicCoin type="rune" size="big" />
      <DynamicCoin type="ankr" size="big" />
      <DynamicCoin type="ftm" size="big" />
      <DynamicCoin type="tomo" size="big" />
      <DynamicCoin type="loki" size="big" />
      <DynamicCoin type="loki" size="normal" />
      <DynamicCoin type="loki" size="small" />
    </div>
  )
})
