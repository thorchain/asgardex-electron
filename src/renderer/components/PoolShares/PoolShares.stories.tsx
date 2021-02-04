import React from 'react'

import { Meta, Story } from '@storybook/react'
import { assetAmount, AssetBNB, AssetBTC, assetToBase, bn } from '@xchainjs/xchain-util'

import { PoolShares } from './PoolShares'
import { PoolShare } from './types'

export const Default: Story = () => {
  const mockData: PoolShare[] = [
    {
      asset: AssetBNB,
      poolShare: bn(100),
      assetDepositPrice: assetToBase(assetAmount(500)),
      runeDepositPrice: assetToBase(assetAmount(400))
    },
    {
      asset: AssetBTC,
      poolShare: bn(100),
      assetDepositPrice: assetToBase(assetAmount(500)),
      runeDepositPrice: assetToBase(assetAmount(400))
    }
  ]

  return <PoolShares data={mockData} priceAsset={AssetBNB} goToStakeInfo={() => console.log('go to stake info')} />
}
Default.storyName = 'default'

const meta: Meta = {
  component: PoolShares,
  title: 'PoolShares'
}

export default meta
