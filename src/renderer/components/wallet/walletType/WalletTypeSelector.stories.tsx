import { ComponentMeta } from '@storybook/react'

import { WalletType } from '../../../../shared/wallet/types'
import { WalletTypeSelector as Component } from './WalletTypeSelector'
import { SelectableWalletType } from './WalletTypeSelector.types'

type Args = {
  selectedWalletType: WalletType
  walletTypes: SelectableWalletType[]
}

const Template = ({ selectedWalletType, walletTypes }: Args) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff' }}>
    <Component
      selectedWalletType={selectedWalletType}
      walletTypes={walletTypes.map((t) => ({ label: t, type: t }))}
      onChange={(t) => console.log('onChanged:', t)}
    />
  </div>
)
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Component,
  title: 'Components/WalletTypeSelector',
  argTypes: {
    selectedWalletType: {
      name: 'selected type',
      control: { type: 'select', options: ['keystore', 'ledger', 'custom'] },
      defaultValue: 'keystore'
    },
    walletTypes: {
      name: 'walletTypes',
      control: { type: 'select', options: [['keystore', 'ledger', 'custom'], ['keystore', 'ledger'], ['custom']] }
    }
  },
  args: {
    selectedWalletType: 'keystore',
    walletTypes: ['keystore', 'ledger', 'custom']
  }
}

export default meta
