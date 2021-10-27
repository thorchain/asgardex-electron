import React from 'react'

import { Meta, Story } from '@storybook/react'
import { Chain } from '@xchainjs/xchain-util'

import { LedgerConfirmationModal } from './'

type Args = {
  chain: Chain
  visible: boolean
}

const Template: Story<Args> = ({ chain, visible }) => {
  return (
    <LedgerConfirmationModal
      visible={visible}
      onClose={() => console.log('onClose')}
      onSuccess={() => console.log('onSuccess')}
      chain={chain}
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
        options: ['BNB', 'BTC', 'ETH']
      },
      defaultValue: 'BNB'
    },
    onClose: {
      action: 'onClose'
    },
    onSuccess: {
      action: 'onSuccess'
    }
  }
}

export default meta
