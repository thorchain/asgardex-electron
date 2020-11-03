import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneB1A, bn } from '@xchainjs/xchain-util'

import { AssetSelect } from './AssetSelect'

storiesOf('Components/Assets/AssetSelect', module).add('default', () => {
  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <AssetSelect
        asset={AssetBNB}
        assets={[AssetBNB, AssetBTC, AssetRuneB1A]}
        priceIndex={{
          RUNE: bn(1),
          BNB: bn(2),
          BTC: bn(3)
        }}
        onSelect={() => {}}
        withSearch
      />
    </div>
  )
})
