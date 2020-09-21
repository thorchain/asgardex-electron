import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn, assetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'

import PoolStatus from './PoolStatus'

storiesOf('Components/PoolStatus', module).add('default', () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '250px' }}>
      <PoolStatus trend={bn(2.66)} label="DEPTH">
        {formatAssetAmountCurrency(assetAmount(12000))}
      </PoolStatus>
    </div>
  )
})
