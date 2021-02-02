import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC } from '@xchainjs/xchain-util'

import { PoolShares } from './PoolShares'
import { PoolShare } from './types'

export const Default: Story = () => {
  const mockData: PoolShare[] = [
    {
      asset: AssetBNB,
      ownership: 1.21,
      value: 1245
    },
    {
      asset: AssetBTC,
      ownership: 1.21,
      value: 1245
    }
  ]

  return (
    <PoolShares
      goToStakeInfo={(asset) => console.log('go to stake info: ', asset)}
      goToDataInfo={(asset) => console.log('go to data info: ', asset)}
      data={mockData}
    />
  )
}
Default.storyName = 'default'

const meta: Meta = {
  component: PoolShares,
  title: 'PoolShares'
}

export default meta
