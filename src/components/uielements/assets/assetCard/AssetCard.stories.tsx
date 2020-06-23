import React from 'react'

import { storiesOf } from '@storybook/react'
import { tokenAmount } from '@thorchain/asgardex-token'
import { bn } from '@thorchain/asgardex-util'

import AssetCard from './AssetCard'

storiesOf('Components/Assets/AssetCard', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetCard
        title="You are swapping"
        asset="bnb"
        assetData={[
          {
            asset: 'rune',
            price: bn(1)
          },
          {
            asset: 'tomo',
            price: bn(1)
          }
        ]}
        amount={tokenAmount(1.354)}
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        withSelection
      />
      <AssetCard title="You will receive" asset="bolt" amount={tokenAmount(13549)} price={bn(596)} slip={2} />
    </div>
  )
})
