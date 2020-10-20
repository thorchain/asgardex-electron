import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneB1A, bn } from '@thorchain/asgardex-util'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { AssetMenu } from './AssetMenu'

const assets = [AssetBNB, AssetBTC, AssetRuneB1A]
const priceIndex = {
  RUNE: bn(1),
  BNB: bn(2),
  BTC: bn(3)
}

storiesOf('Components/Assets/AssetMenu', module).add('with search', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetMenu
        withSearch={true}
        asset={ASSETS_MAINNET.BNB}
        assets={assets}
        priceIndex={priceIndex}
        searchDisable={[]}
        onSelect={(key) => console.log(key)}
      />
    </div>
  )
})

storiesOf('Components/Assets/AssetMenu', module).add('without search', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetMenu
        asset={ASSETS_MAINNET.BNB}
        assets={assets}
        priceIndex={priceIndex}
        withSearch={false}
        searchDisable={[]}
        onSelect={(key) => console.log(key)}
      />
    </div>
  )
})
