import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount } from '@thorchain/asgardex-util'

import PoolShare from './PoolShare'

storiesOf('Components/PoolShare', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <PoolShare
        source="RUNE"
        target="CAN"
        poolShare={bn(100)}
        assetEarnedAmount={assetAmount(200)}
        assetEarnedPrice={assetAmount(300)}
        assetStakedPrice={assetAmount(120.1)}
        assetStakedShare={assetAmount(500)}
        basePriceAsset="$USD"
        loading={false}
        runeEarnedAmount={assetAmount(200)}
        runeEarnedPrice={assetAmount(300)}
        runeStakedPrice={assetAmount(400)}
        runeStakedShare={assetAmount(500)}
      />
    </div>
  )
})
