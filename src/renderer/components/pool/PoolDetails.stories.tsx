import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetETH, bn } from '@xchainjs/xchain-util'

import { ONE_BN } from '../../const'
import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      liquidity={assetAmount(1)}
      volumn={assetAmount(1)}
      earnings={assetAmount(1)}
      fees={assetAmount(1)}
      totalTx={bn(10)}
      totalSwaps={bn(20)}
      members={bn(30)}
      apy={bn(120)}
      price={assetAmount(1)}
      priceSymbol={'R'}
      asset={AssetETH}
      priceRatio={ONE_BN}
      HistoryView={() => <>Actions History Here</>}
      ChartView={() => <>Pool Chart Here</>}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
