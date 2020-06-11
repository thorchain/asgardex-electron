import React from 'react'

import { storiesOf } from '@storybook/react'
import { tokenAmount } from '@thorchain/asgardex-token'
import { bn } from '@thorchain/asgardex-util'

import CoinData from './CoinData'

storiesOf('Components/Coins/CoinData', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <CoinData asset="bnb" price={bn(217.92)} />
      <CoinData asset="bnb" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData asset="ftm" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData asset="rune" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData asset="ankr" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData asset="bolt" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData asset="tomo" assetValue={tokenAmount(2.49274)} price={bn(217.92)} />
      <CoinData
        asset="bnb"
        target="bolt"
        assetValue={tokenAmount(2.49274)}
        targetValue={tokenAmount(0.49555)}
        price={bn(217.92)}
      />
      <CoinData
        asset="bnb"
        target="bolt"
        assetValue={tokenAmount(2.49274)}
        targetValue={tokenAmount(0.49555)}
        price={bn(217.92)}
        size="big"
      />
    </div>
  )
})
