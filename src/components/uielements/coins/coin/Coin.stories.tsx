import React from 'react'

import { storiesOf } from '@storybook/react'

import Coin from './Coin'

storiesOf('Components/Coins/Coin', module).add('default', () => {
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Coin type="bnb" size="small" />
        <Coin type="bolt" size="small" />
        <Coin type="rune" size="small" />
        <Coin type="ankr" size="small" />
        <Coin type="ftm" size="small" />
        <Coin type="tomo" size="small" />
        <Coin type="loki" size="small" />
      </div>
      <div style={{ display: 'flex' }}>
        <Coin type="bnb" size="big" />
        <Coin type="bolt" size="big" />
        <Coin type="rune" size="big" />
        <Coin type="ankr" size="big" />
        <Coin type="ftm" size="big" />
        <Coin type="tomo" size="big" />
        <Coin type="loki" size="big" />
      </div>
      <div style={{ display: 'flex' }}>
        <Coin type="bnb" over="bolt" size="small" />
        <Coin type="bnb" over="rune" size="small" />
        <Coin type="bnb" over="ankr" size="small" />
        <Coin type="bnb" over="ftm" size="small" />
        <Coin type="bnb" over="tomo" size="small" />
        <Coin type="bnb" over="loki" size="small" />
        <Coin type="loki" over="bnb" size="small" />
      </div>
      <div style={{ display: 'flex' }}>
        <Coin type="bnb" over="bolt" size="big" />
        <Coin type="bnb" over="rune" size="big" />
        <Coin type="bnb" over="ankr" size="big" />
        <Coin type="bnb" over="ftm" size="big" />
        <Coin type="bnb" over="tomo" size="big" />
        <Coin type="bnb" over="loki" size="big" />
      </div>
    </div>
  )
})
