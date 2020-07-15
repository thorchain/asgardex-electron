import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { ONE_ASSET_BASE_AMOUNT } from '../../../../const'
import AssetCard from './AssetCard'

storiesOf('Components/Assets/AssetCard', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetCard
        title="You are swapping"
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
        amount={assetToBase(assetAmount(1.354))}
        price={bn(600)}
        priceIndex={{
          RUNE: bn(1)
        }}
        withSelection
      />
      <AssetCard
        title="You will receive"
        asset={ASSETS_MAINNET.BOLT}
        amount={assetToBase(assetAmount(13.549))}
        price={bn(596)}
        slip={2}
      />
    </div>
  )
})
