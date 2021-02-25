import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative, bn } from '@xchainjs/xchain-util'

import { AssetMenu } from './AssetMenu'

const assets = [AssetBNB, AssetBTC, AssetRuneNative]
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
        asset={AssetBNB}
        assets={assets}
        priceIndex={priceIndex}
        searchDisable={[]}
        onSelect={(key) => console.log(key)}
        network="testnet"
      />
    </div>
  )
})

storiesOf('Components/Assets/AssetMenu', module).add('without search', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetMenu
        asset={AssetBNB}
        assets={assets}
        priceIndex={priceIndex}
        withSearch={false}
        searchDisable={[]}
        onSelect={(key) => console.log(key)}
        network="testnet"
      />
    </div>
  )
})
