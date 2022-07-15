import { ComponentMeta } from '@storybook/react'
import { assetAmount, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { PoolStatus as Component } from './PoolStatus'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/PoolStatus',
  argTypes: {
    label: {
      control: 'text',
      defaultValue: 'Depth'
    }
  },
  args: {
    displayValue: formatAssetAmountCurrency({ amount: assetAmount(12000) }),
    fullValue: formatAssetAmountCurrency({ amount: assetAmount(12000) })
  }
}

export default meta
