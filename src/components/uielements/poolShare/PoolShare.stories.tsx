import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import PoolShare from './PoolShare'

storiesOf('Components/PoolShare', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <PoolShare
        source="RUNE"
        target="CAN"
        poolShare={bn(100)}
        assetEarnedAmount={'200'}
        assetEarnedPrice={'300'}
        assetStakedPrice="120.10"
        assetStakedShare={'500'}
        basePriceAsset="$USD"
        loading={false}
        runeEarnedAmount="200"
        runeEarnedPrice="300"
        runeStakedPrice="400"
        runeStakedShare="500"
      />
    </div>
  )
})
