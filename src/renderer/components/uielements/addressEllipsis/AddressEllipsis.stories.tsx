import { ComponentMeta } from '@storybook/react'
import { BNBChain } from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_MAINNET, BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
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

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/AddressEllipsis',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    address: {
      control: {
        type: 'select',
        options: ['testnet', 'mainnet'],
        mapping: {
          testnet: BNB_ADDRESS_TESTNET,
          mainnet: BNB_ADDRESS_MAINNET
        }
      },
      defaultValue: 'mainnet'
    }
  }
}

export default meta
