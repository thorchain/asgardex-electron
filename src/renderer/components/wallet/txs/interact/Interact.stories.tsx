import React from 'react'

import { Meta, Story } from '@storybook/react'

import { WalletType } from '../../../../../shared/wallet/types'
import { Interact as Component } from './Interact'
import { InteractType } from './Interact.types'

type Args = {
  interactType: InteractType
  walletType: WalletType
}

const Template: Story<Args> = ({ interactType, walletType }) => (
  <Component
    interactType={interactType}
    interactTypeChanged={(type) => console.log('Interact type changed ', type)}
    network="testnet"
    walletType={walletType}
  />
)

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: Component,
  title: 'Wallet/Interact',
  argTypes: {
    interactType: {
      name: 'type',
      control: { type: 'select', options: ['bond', 'unbond', 'leave', 'custom'] },
      defaultValue: 'bond'
    },

    walletType: {
      name: 'wallet type',
      control: { type: 'select', options: ['keystore', 'ledger'] },
      defaultValue: 'keystore'
    }
  }
}

export default meta
