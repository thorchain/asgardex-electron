import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import AssetMenu from './AssetMenu'

storiesOf('Components/Assets/AssetMenu', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetMenu
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
        priceIndex={{
          RUNE: bn(1)
        }}
        unit="RUNE"
        withSearch={false}
        searchDisable={[]}
        onSelect={() => {}}
      />
    </div>
  )
})
