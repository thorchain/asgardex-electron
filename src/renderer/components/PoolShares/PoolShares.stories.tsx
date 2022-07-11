import React from 'react'

import { Meta, Story } from '@storybook/react'
import { assetAmount, AssetBNB, AssetBTC, assetToBase, bn } from '@xchainjs/xchain-util'

import { ZERO_BASE_AMOUNT } from '../../const'
import { DEFAULT_MIMIR_HALT } from '../../services/thorchain/const'
import { PoolShares as Component, Props as ComponentProps } from './PoolShares'

const defaultProps: ComponentProps = {
  haltedChains: [],
  mimirHalt: DEFAULT_MIMIR_HALT,
  data: [
    {
      asset: AssetBNB,
      sharePercent: bn(10),
      runeShare: assetToBase(assetAmount(10)),
      assetShare: assetToBase(assetAmount(20)),
      assetDepositPrice: assetToBase(assetAmount(100)),
      runeDepositPrice: assetToBase(assetAmount(200)),
      type: 'sym'
    },
    {
      asset: AssetBTC,
      sharePercent: bn(20),
      runeShare: assetToBase(assetAmount(1)),
      assetShare: assetToBase(assetAmount(100)),
      assetDepositPrice: assetToBase(assetAmount(1000)),
      runeDepositPrice: assetToBase(assetAmount(10)),
      type: 'sym'
    },
    {
      asset: AssetBTC,
      sharePercent: bn(10),
      runeShare: ZERO_BASE_AMOUNT,
      assetShare: assetToBase(assetAmount(50)),
      assetDepositPrice: assetToBase(assetAmount(1000)),
      runeDepositPrice: assetToBase(assetAmount(10)),
      type: 'asym'
    }
  ],
  loading: false,
  priceAsset: AssetBNB,
  openShareInfo: () => console.log('go to stake info'),
  network: 'testnet'
}
export const Default: Story = () => <Component {...defaultProps} />
Default.storyName = 'default'

export const Loading: Story = () => {
  const props: ComponentProps = {
    ...defaultProps,
    data: [],
    loading: true
  }
  return <Component {...props} />
}
Loading.storyName = 'loading'

const meta: Meta = {
  component: Component,
  title: 'PoolShares'
}

export default meta
