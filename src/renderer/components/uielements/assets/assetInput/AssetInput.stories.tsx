import { Meta, StoryFn } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase } from '@xchainjs/xchain-util'

import { AssetInput as Component, Props } from './AssetInput'

export const Default: StoryFn<Props> = (args) => <Component {...args} />

const amount = assetToBase(assetAmount(123, 8))

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
    showError: false,
    disabled: false,
    asset: AssetBNB
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
