import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetETH, bn } from '@xchainjs/xchain-util'

import { ZERO_BN } from '../../const'
import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      poolDetail={{
        asset: 'asset',
        assetDepth: '0',
        assetPrice: '0',
        assetPriceUSD: '0',
        poolAPY: '0',
        runeDepth: '0',
        status: '',
        units: '0',
        volume24h: ''
      }}
      priceRatio={ZERO_BN}
      earnings={assetAmount(1)}
      fees={assetAmount(1)}
      totalTx={bn(10)}
      totalSwaps={bn(20)}
      members={bn(30)}
      priceSymbol={'R'}
      asset={AssetETH}
      HistoryView={() => <>Actions History Here</>}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
