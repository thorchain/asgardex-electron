import React from 'react'

import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'

import { AssetInput } from './AssetInput'

const onChange = (value: BaseAmount) => {
  console.log('value ', value.amount().toString())
}

export const StoryDefault: Story = () => (
  <AssetInput
    title="swap amount"
    status="slip 2%"
    amount={baseAmount(1234500000)}
    maxAmount={baseAmount(1234600000)}
    asset={AssetBNB}
    onChange={onChange}
  />
)
StoryDefault.storyName = 'default'

export const StoryDecimal2: Story = () => (
  <AssetInput
    title="amount"
    amount={assetToBase(assetAmount(123, 2))}
    maxAmount={assetToBase(assetAmount(124, 2))}
    asset={AssetBNB}
    onChange={onChange}
  />
)
StoryDecimal2.storyName = 'decimal 2'

const meta: Meta = {
  component: AssetInput,
  title: 'Components/Assets/AssetInput',
  decorators: [
    (S: Story) => (
      <div style={{ padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
