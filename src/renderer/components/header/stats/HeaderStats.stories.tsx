import * as RD from '@devexperts/remote-data-ts'
import { Meta, StoryFn } from '@storybook/react'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetBUSDBD1 } from '../../../const'
import { HeaderStats as Component, Props } from './HeaderStats'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: Meta = {
  component: Component,
  title: 'Components/HeaderStats',
  argTypes: {
    reloadRunePrice: { action: 'reloadRunePrice' },
    reloadVolume24Price: { action: 'reloadVolume24Price' }
  },
  args: {
    runePrice: RD.success({
      asset: AssetBUSDBD1,
      amount: assetToBase(assetAmount('14.08'))
    }),
    volume24Price: RD.success({
      asset: AssetBUSDBD1,
      amount: assetToBase(assetAmount('24000000'))
    })
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '10px 0', backgroundColor: 'white', display: 'flex' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
