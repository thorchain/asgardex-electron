import { Story, Meta } from '@storybook/react'

import { WalletType } from '../../../../shared/wallet/types'
import { WalletTypeLabel as Component } from './WalletTypeLabel'

type Args = {
  walletType: WalletType
}

const Template: Story<Args> = ({ walletType }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff' }}>
    <Component>{walletType}</Component>
  </div>
)

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: Component,
  title: 'Common/WalletTypeLabel',
  argTypes: {
    walletType: {
      name: 'wallet type',
      control: { type: 'select', options: ['keystore', 'ledger'] },
      defaultValue: 'keystore'
    }
  }
}

export default meta
