import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { AssetBUSDBD1 } from '../../../const'
import { UISwapFees } from './Fees.types'
import { SwapFees as Component, Props } from './SwapFees'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/SwapFees',
  argTypes: {
    fees: {
      options: ['init', 'loading', 'error', 'success'],
      mapping: {
        intitial: RD.initial,
        loading: RD.pending,
        error: RD.failure(Error('fees error')),
        success: RD.success<never, UISwapFees>({
          inbound: { amount: assetToBase(assetAmount(0.02)), asset: AssetRuneNative },
          priceInbound: { amount: assetToBase(assetAmount(0.05)), asset: AssetBUSDBD1 },
          outbound: { amount: assetToBase(assetAmount(0.0225)), asset: AssetBNB },
          priceOutbound: { amount: assetToBase(assetAmount(0.0075)), asset: AssetBUSDBD1 }
        })
      }
    },
    reloadFees: { action: 'reloadFees' }
  },
  args: {
    disabled: false,
    fees: RD.initial
  }
}

export default meta
