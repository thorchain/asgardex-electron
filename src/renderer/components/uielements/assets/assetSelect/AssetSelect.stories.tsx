import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative, bn } from '@xchainjs/xchain-util'

import { AssetSelect } from './AssetSelect'

storiesOf('Components/Assets/AssetSelect', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetSelect
        asset={AssetBNB}
        assets={[AssetBNB, AssetBTC, AssetRuneNative]}
        priceIndex={{
          RUNE: bn(1),
          BNB: bn(2),
          BTC: bn(3)
        }}
        onSelect={() => {}}
        withSearch
        network="testnet"
      />
    </div>
  )
})
