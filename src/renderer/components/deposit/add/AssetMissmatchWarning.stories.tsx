import { ComponentMeta, StoryFn } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import * as AT from '../../../storybook/argTypes'
import { AssetWithAddress } from '../../../types/asgardex'
import { AssetMissmatchWarning as Component, Props } from './AssetMissmatchWarning'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const bnb: AssetWithAddress = { asset: AssetBNB, address: BNB_ADDRESS_TESTNET }
const rune: AssetWithAddress = { asset: AssetRuneNative, address: RUNE_ADDRESS_TESTNET }

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Deposit/AssetMissmatchWarning',
  argTypes: {
    network: AT.network
  },
  args: {
    assets: [bnb, rune],
    network: 'mainnet'
  }
}

export default meta
