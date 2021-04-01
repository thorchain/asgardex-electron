import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount, AssetETH, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ONE_BN } from '../../const'
import { PoolDetails } from './PoolDetails'

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
      priceUSD={assetAmount(1)}
      priceSymbol={'R'}
      asset={O.some(AssetETH)}
      swapAllHistoryRD={RD.initial}
      swapWeekHistoryRD={RD.initial}
      depthAllHistoryRD={RD.initial}
      depthWeekHistoryRD={RD.initial}
      priceRatio={ONE_BN}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
