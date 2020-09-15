import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount } from '@thorchain/asgardex-util'

import PoolShare from './PoolShare'

export const defaultPoolShare = (
  <PoolShare
    source="RUNE"
    target="CAN"
    poolShare={bn(100)}
    assetEarnedAmount={assetToBase(assetAmount(200))}
    assetEarnedPrice={assetToBase(assetAmount(300))}
    assetStakedPrice={assetToBase(assetAmount(120.1))}
    assetStakedShare={assetToBase(assetAmount(500))}
    basePriceAsset="$USD"
    loading={false}
    runeEarnedAmount={assetToBase(assetAmount(200))}
    runeEarnedPrice={assetToBase(assetAmount(300))}
    runeStakedPrice={assetToBase(assetAmount(400))}
    runeStakedShare={assetToBase(assetAmount(500))}
  />
)

storiesOf('Components/PoolShare', module).add('default', () => {
  return <div style={{ padding: '20px' }}>{defaultPoolShare}</div>
})
