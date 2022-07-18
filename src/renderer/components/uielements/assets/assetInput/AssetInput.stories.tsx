import { Meta, StoryFn } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase } from '@xchainjs/xchain-util'

import { AssetInput as Component, Props } from './AssetInput'

export const Default: StoryFn<Props> = (args) => <Component {...args} />

const amount = assetToBase(assetAmount(123, 8))
const maxAmount = assetToBase(assetAmount(456, 8))

const meta: Meta = {
  component: Component,
  title: 'Components/Assets/AssetInput',
  argTypes: {
    onChange: { action: 'onChange' },
    amount: {
      options: ['normal', 'decimal'],
      mapping: {
        normal: amount,
        decimal: assetToBase(assetAmount(321, 2))
      }
    },
    maxAmount: {
      options: ['normal', 'decimal'],
      mapping: {
        normal: maxAmount,
        decimal: assetToBase(assetAmount(654, 2))
      }
    }
  },
  args: {
    title: 'Swap amount',
    status: 'slip 2%',
    titleTooltip: 'Title Tooltip',
    maxInfoText: 'max balance = balance - swap fees',
    asset: AssetBNB,
    amount: amount,
    maxAmount: maxAmount
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
