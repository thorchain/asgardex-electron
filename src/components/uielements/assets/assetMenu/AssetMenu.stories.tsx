import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import { ONE_ASSET_BASE_AMOUNT } from '../../../../const'
import { ASSETS_MAINNET } from '../../../../mock/assets'
import AssetMenu from './AssetMenu'

storiesOf('Components/Assets/AssetMenu', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetMenu
        asset={ASSETS_MAINNET.BNB}
        assetData={[
          {
            asset: ASSETS_MAINNET.BNB,
            price: ONE_ASSET_BASE_AMOUNT
          },
          {
            asset: ASSETS_MAINNET.TOMO,
            price: ONE_ASSET_BASE_AMOUNT
          }
        ]}
        priceIndex={{
          RUNE: bn(1)
        }}
        withSearch={false}
        searchDisable={[]}
        onSelect={(key) => console.log(key)}
      />
    </div>
  )
})
