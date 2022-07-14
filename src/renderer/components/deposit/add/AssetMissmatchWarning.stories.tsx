import { ComponentMeta } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { AssetWithAddress } from '../../../types/asgardex'
import { AssetMissmatchWarning as Component } from './AssetMissmatchWarning'

const bnb: AssetWithAddress = { asset: AssetBNB, address: BNB_ADDRESS_TESTNET }
const rune: AssetWithAddress = { asset: AssetRuneNative, address: RUNE_ADDRESS_TESTNET }

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Deposit/AssetMissmatchWarning',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    }
  },
  args: {
    assets: [bnb, rune]
  }
}

export default meta
