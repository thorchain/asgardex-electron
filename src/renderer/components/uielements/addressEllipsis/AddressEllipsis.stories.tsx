import React from 'react'

import { Meta, Story } from '@storybook/react'

import { BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { AddressEllipsis } from './index'

export const mainnet: Story = () => <AddressEllipsis address={BNB_ADDRESS_TESTNET} chain="THOR" network="mainnet" />
mainnet.storyName = 'mainnet'

export const testnet: Story = () => <AddressEllipsis address={BNB_ADDRESS_TESTNET} chain="THOR" network="testnet" />
testnet.storyName = 'testnet'

const meta: Meta = {
  component: AddressEllipsis,
  title: 'Components/AddressEllipsis'
}

export default meta
