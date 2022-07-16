import { ComponentMeta, StoryFn } from '@storybook/react'
import { bn, assetToBase, assetAmount, AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { BNB_DECIMAL } from '../../../helpers/assetHelper'
import { PoolShare as Component, Props } from './PoolShare'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/PoolShare',
  argTypes: {
    loading: {
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    )
  ],
  args: {
    asset: { asset: AssetBNB, decimal: BNB_DECIMAL },
    assetPrice: assetToBase(assetAmount(120.1)),
    shares: { rune: assetToBase(assetAmount(1500)), asset: assetToBase(assetAmount(500)) },
    addresses: { rune: O.some(RUNE_ADDRESS_TESTNET), asset: O.some(BNB_ADDRESS_TESTNET) },
    priceAsset: AssetRuneNative,
    runePrice: assetToBase(assetAmount(400)),
    poolShare: bn(100),
    depositUnits: bn(20100000)
  }
}

export default meta
