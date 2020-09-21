import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'

import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      asset={'tomob'}
      depth={assetAmount(12000)}
      volume24hr={assetAmount(12000)}
      allTimeVolume={assetAmount(12000)}
      totalSwaps={7042}
      totalStakers={307}
      returnToDate={44.64}
    />
  )
}

storiesOf('Components/Stake/PoolDetails', module).add('default', PoolDetailsStory)
