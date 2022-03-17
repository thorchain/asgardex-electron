import React from 'react'

import { Meta, Story } from '@storybook/react'
import { Chain } from '@xchainjs/xchain-util'

import { LedgerConfirmationModal } from './'

type Args = {
  chain: Chain
  visible: boolean
  description: string
}

const Template: Story<Args> = ({ chain, visible, description }) => {
  return (
    <LedgerConfirmationModal
      visible={visible}
      onClose={() => console.log('onClose')}
      onSuccess={() => console.log('onSuccess')}
      chain={chain}
      description={description}
      network="mainnet"
      addresses={{
        sender: 'qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a',
        recipient: 'qr95sy3j9xwd2ap32xkykttr4cvcu7as4y0qverfuy'
      }}
    />
  )
}

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: LedgerConfirmationModal,
  title: 'Components/Modal/LedgerConfirmation',
  argTypes: {
    visible: {
      name: 'Show / hide',
      control: {
        type: 'boolean'
      },
      defaultValue: true
    },
    chain: {
      name: 'Chain',
      control: {
        type: 'select',
        options: ['BNB', 'BCH', 'BTC', 'ETH']
      },
      defaultValue: 'BCH'
    },
    onClose: {
      action: 'onClose'
    },
    onSuccess: {
      action: 'onSuccess'
    },
    description: {
      control: {
        type: 'text'
      },
      defaultValue: 'Any description'
    }
  }
}

export default meta
