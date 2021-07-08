import React from 'react'

import { Meta, Story } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'

import { BNB_ADDRESS_MAINNET, BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { AddressEllipsis } from './index'

const mainnetTemplate: Story = (args) => (
  <div style={{ width: args.width || 400 }}>
    <AddressEllipsis address={BNB_ADDRESS_MAINNET} chain={BNBChain} network="mainnet" />
  </div>
)

export const mainnet: Story = mainnetTemplate.bind({})
mainnet.storyName = 'mainnet'
mainnet.args = {
  width: 400
}

const testnetTemplate: Story = (args) => (
  <div style={{ width: args.width || 400 }}>
    <AddressEllipsis address={BNB_ADDRESS_TESTNET} chain={BNBChain} network="testnet" />
  </div>
)

export const testnet: Story = testnetTemplate.bind({})
testnet.storyName = 'testnet'
testnet.args = {
  width: 400
}

const meta: Meta = {
  component: AddressEllipsis,
  title: 'Components/AddressEllipsis'
}

export default meta
