import { ComponentMeta, StoryFn } from '@storybook/react'
import { assetAmount, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { PoolStatus as Component, Props } from './PoolStatus'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/PoolStatus',
  args: {
    label: 'Depth',
    displayValue: formatAssetAmountCurrency({ amount: assetAmount(12000) }),
    fullValue: formatAssetAmountCurrency({ amount: assetAmount(12000) }),
    isLoading: false
  }
}

export default meta
