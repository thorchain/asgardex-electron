import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, bn } from '@thorchain/asgardex-util'

import PoolDetails from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      depth={assetAmount(1)}
      depthTrend={bn(12)}
      volume24hr={assetAmount(123)}
      volume24hrTrend={bn(11)}
      allTimeVolume={assetAmount(12000)}
      totalSwaps={7042}
      totalStakers={307}
      returnToDate={'44.64'}
      priceSymbol={'R'}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
