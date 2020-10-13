import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneB1A, assetToBase } from '@thorchain/asgardex-util'

import PoolShareContent from './PoolShareContent'

const rAmount = assetToBase(assetAmount(11.22))
const rPrice = assetToBase(assetAmount(1.01))
const aPrice = assetToBase(assetAmount(2.02))
const aAmount = assetToBase(assetAmount(22.11))

storiesOf('Components/PoolShareContent', module)
  .add('default', () => {
    return (
      <PoolShareContent
        sourceAsset={AssetRuneB1A}
        targetAsset={AssetBNB}
        runeAmount={rAmount}
        runePrice={rPrice}
        assetAmount={aAmount}
        assetPrice={aPrice}
        priceAsset={AssetRuneB1A}
        loading={false}
      />
    )
  })
  .add('loading', () => {
    return (
      <PoolShareContent
        sourceAsset={AssetRuneB1A}
        targetAsset={AssetBNB}
        runeAmount={rAmount}
        runePrice={rPrice}
        assetAmount={aAmount}
        assetPrice={aPrice}
        priceAsset={AssetRuneB1A}
        loading={true}
      />
    )
  })
