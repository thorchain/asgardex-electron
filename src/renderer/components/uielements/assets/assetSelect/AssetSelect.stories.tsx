import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../../const'
import AssetSelect from './AssetSelect'

storiesOf('Components/Assets/AssetSelect', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetSelect
        asset={ASSETS_MAINNET.BNB}
        assetData={[
          {
            asset: ASSETS_MAINNET.RUNE,
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
        onSelect={() => {}}
      />
    </div>
  )
})
