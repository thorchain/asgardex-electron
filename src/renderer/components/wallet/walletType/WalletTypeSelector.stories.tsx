import { Story, Meta } from '@storybook/react'

import { WalletType } from '../../../../shared/wallet/types'
import { WalletTypeSelector as Component } from './WalletTypeSelector'

type Args = {
  selectedWalletType: WalletType
  walletTypes: WalletType[]
}

const Template: Story<Args> = ({ selectedWalletType, walletTypes }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff' }}>
    <Component
      selectedWalletType={selectedWalletType}
      walletTypes={walletTypes.map((t) => ({ label: t, type: t }))}
      onChange={(t) => console.log('onChanged:', t)}
    />
  </div>
)

export const Default = Template.bind({})

const meta: Meta<Args> = {
  component: Component,
  title: 'Common/WalletTypeSelector',
  argTypes: {
    selectedWalletType: {
      name: 'selected type',
      control: { type: 'select', options: ['keystore', 'ledger', 'custom'] },
      defaultValue: 'keystore'
    },
    walletTypes: {
      name: 'walletTypes',
      control: { type: 'select', options: [['keystore', 'ledger', 'custom'], ['keystore', 'ledger'], ['custom']] },
      defaultValue: ['keystore', 'ledger', 'custom']
    }
  }
}

export default meta
