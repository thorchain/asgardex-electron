import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, bn } from '@thorchain/asgardex-util'

import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      depth={assetAmount(12000000000000000000000000000000)}
      depthTrend={bn(12)}
      volume24hr={assetAmount(12000)}
      allTimeVolume={assetAmount(12000)}
      totalSwaps={7042}
      totalStakers={307}
      returnToDate={44.64}
      basePriceAsset={'rune'}
    />
  )
}

storiesOf('Components/Stake/PoolDetails', module).add('default', PoolDetailsStory)
