import React from 'react'

import { Meta, Story } from '@storybook/react'
import { bn, AssetBNB, assetAmount, assetToBase, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { AssetCard, Props as AssetCardProps } from './AssetCard'

const defaultProps: AssetCardProps = {
  assetBalance: assetToBase(assetAmount(12)),
  asset: AssetBNB,
  assets: [AssetBNB, AssetBTC, AssetRuneNative],
  selectedAmount: ZERO_BASE_AMOUNT,
  onChangeAssetAmount: (value) => console.log('assetAmount', value),
  inputOnFocusHandler: () => console.log('onFocus'),
  inputOnBlurHandler: () => console.log('onBlur'),
  onChangePercent: (percent) => console.log('percent', percent),
  price: bn(600),
  percentValue: 55,
  maxAmount: assetToBase(assetAmount(10)),
  network: 'testnet'
}

export const Default: Story = () => <AssetCard {...defaultProps} />

Default.storyName = 'default'

const meta: Meta = {
  component: AssetCard,
  title: 'Components/Assets/AssetCard',
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
