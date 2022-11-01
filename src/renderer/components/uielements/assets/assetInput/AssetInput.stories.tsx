import { Meta, StoryFn } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase } from '@xchainjs/xchain-util'

import { AssetBUSD74E } from '../../../../const'
import { AssetInput as Component, Props } from './AssetInput'

export const Default: StoryFn<Props> = (args) => <Component {...args} />

const amount = { amount: assetToBase(assetAmount(1.23, 8)), asset: AssetBNB }
const priceAmount = { amount: assetToBase(assetAmount(345, 8)), asset: AssetBUSD74E }

const meta: Meta = {
  component: Component,
  title: 'Components/Assets/AssetInput',
  argTypes: {
    onChange: { action: 'onChange' },
    onBlur: { action: 'onBlur' },
    onFocus: { action: 'onFocus' },
    amount: {
      options: ['normal', 'decimal'],
      mapping: {
        normal: amount,
        decimal: assetToBase(assetAmount(321, 2))
      }
    }
  },
  args: {
    title: 'Swap amount',
    titleTooltip: 'Title Tooltip',
    amount,
    priceAmount,
    showError: false,
    disabled: false
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
