import { ComponentMeta } from '@storybook/react'

import { WalletType } from '../../../../../shared/wallet/types'
import { Interact as Component } from './Interact'
import { InteractType } from './Interact.types'

type Args = {
  interactType: InteractType
  walletType: WalletType
}

const Template = ({ interactType, walletType }: Args) => (
  <Component
    interactType={interactType}
    interactTypeChanged={(type) => console.log('Interact type changed ', type)}
    network="testnet"
    walletType={walletType}
  />
)
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Wallet/Interact',
  argTypes: {
    interactType: {
      control: { type: 'select', options: ['bond', 'unbond', 'leave', 'custom'] }
    },
    walletType: {
      control: { type: 'select', options: ['keystore', 'ledger'] }
    }
  },
  args: { interactType: 'bond', walletType: 'keystore' }
}

export default meta
