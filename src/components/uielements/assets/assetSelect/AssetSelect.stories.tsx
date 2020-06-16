import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import AssetSelect from './AssetSelect'

storiesOf('Components/Assets/AssetSelect', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetSelect
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
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        onSelect={(_: number) => {}}
      />
    </div>
  )
})
