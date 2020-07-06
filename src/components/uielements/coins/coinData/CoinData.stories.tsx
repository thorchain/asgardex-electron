import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import CoinData from './CoinData'

const assetValue = assetToBase(assetAmount(2.49274))
const targetValue = assetToBase(assetAmount(0.49555))
const price = assetToBase(assetAmount(217.92))

storiesOf('Components/Coins/CoinData', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <CoinData asset={ASSETS_MAINNET.BNB} price={price} />
      <CoinData asset={ASSETS_MAINNET.BNB} assetValue={assetValue} price={price} />
      <CoinData asset={ASSETS_MAINNET.FTM} assetValue={assetValue} price={price} />
      <CoinData asset={ASSETS_MAINNET.RUNE} assetValue={assetValue} price={price} />
      <CoinData asset={ASSETS_MAINNET.BOLT} assetValue={assetValue} price={price} />
      <CoinData asset={ASSETS_MAINNET.TOMO} assetValue={assetValue} price={price} />
      <CoinData
        asset={ASSETS_MAINNET.BNB}
        target={ASSETS_MAINNET.BOLT}
        assetValue={assetValue}
        targetValue={targetValue}
        price={price}
      />
      <CoinData
        asset={ASSETS_MAINNET.BNB}
        target={ASSETS_MAINNET.BOLT}
        assetValue={assetValue}
        targetValue={targetValue}
        price={price}
        size="big"
      />
    </div>
  )
})
