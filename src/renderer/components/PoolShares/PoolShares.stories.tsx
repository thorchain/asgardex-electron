import React from 'react'

import { Meta, Story } from '@storybook/react'
import { assetAmount, AssetBNB, AssetBTC, assetToBase, bn } from '@xchainjs/xchain-util'

import { PoolShares } from './PoolShares'
import { PoolShareTableData } from './PoolShares.types'

export const Default: Story = () => {
  const mockData: PoolShareTableData = [
    {
      asset: AssetBNB,
      sharePercent: bn(10),
      runeShare: assetToBase(assetAmount(10)),
      assetShare: assetToBase(assetAmount(20)),
      assetDepositPrice: assetToBase(assetAmount(100)),
      runeDepositPrice: assetToBase(assetAmount(200))
    },
    {
      asset: AssetBTC,
      sharePercent: bn(20),
      runeShare: assetToBase(assetAmount(1)),
      assetShare: assetToBase(assetAmount(100)),
      assetDepositPrice: assetToBase(assetAmount(1000)),
      runeDepositPrice: assetToBase(assetAmount(10))
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
