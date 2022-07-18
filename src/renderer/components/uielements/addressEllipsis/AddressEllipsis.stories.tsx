import { ComponentMeta } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_MAINNET, BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import * as AT from '../../../storybook/argTypes'
import { AddressEllipsis as Component } from './index'

type Args = {
  network: Network
  address: string
  width: number
}

const Template = ({ address, network, width }: Args) => (
  <div style={{ width: width || 400 }}>
    <Component address={address} chain={BNBChain} network={network} />
  </div>
)
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/AddressEllipsis',
  argTypes: {
    network: AT.network,
    address: {
      options: ['testnet', 'mainnet'],
      mapping: {
        testnet: BNB_ADDRESS_TESTNET,
        mainnet: BNB_ADDRESS_MAINNET
      }
    }
  },
  args: { network: 'mainnet', address: BNB_ADDRESS_MAINNET }
}

export default meta
