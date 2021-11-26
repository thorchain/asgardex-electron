import React from 'react'

import { Story, Meta } from '@storybook/react'
import { AssetBNB, AssetRuneNative } from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { AssetWithAddress, AssetsWithAddress } from '../../../types/asgardex'
import { AssetMissmatchWarning as Component } from './AssetMissmatchWarning'

const bnb: AssetWithAddress = { asset: AssetBNB, address: BNB_ADDRESS_TESTNET }
const rune: AssetWithAddress = { asset: AssetRuneNative, address: RUNE_ADDRESS_TESTNET }

const assets: AssetsWithAddress = [bnb, rune]

type Args = {
  network: Network
}

const Template: Story<Args> = ({ network }) => {
  return <Component assets={assets} network={network} />
}

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
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
  }
}

export default meta
