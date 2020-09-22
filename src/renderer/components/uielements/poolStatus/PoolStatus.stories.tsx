import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'

import PoolStatus from './PoolStatus'

storiesOf('Components/PoolStatus', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
      <PoolStatus
        trend={bn(2.66)}
        label="DEPTH"
        displayValue={formatAssetAmountCurrency(assetAmount(12000))}
        fullValue={formatAssetAmountCurrency(assetAmount(12000))}
      />
    </div>
  )
})
