import { ComponentMeta } from '@storybook/react'

import { WalletTypeLabel as Component } from './WalletTypeLabel'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Common/WalletTypeLabel',
  argTypes: {
    children: {
      name: 'wallet type',
      options: ['keystore', 'ledger'],
      defaultValue: 'keystore'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
