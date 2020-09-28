import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetToBase, assetAmount } from '@thorchain/asgardex-util'

import PoolShare from './PoolShare'

export const DefaultPoolShare = () => (
  <PoolShare
    source="RUNE"
    target="CAN"
    poolShare={bn(100)}
    assetStakedPrice={assetToBase(assetAmount(120.1))}
    assetStakedShare={assetToBase(assetAmount(500))}
    basePriceSymbol="USD"
    loading={false}
    runeStakedPrice={assetToBase(assetAmount(400))}
    runeStakedShare={assetToBase(assetAmount(500))}
  />
)

storiesOf('Components/PoolShare', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <DefaultPoolShare />
    </div>
  )
})
