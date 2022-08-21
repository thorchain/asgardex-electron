import { ComponentMeta, StoryFn } from '@storybook/react'

import { KeystoreWalletsUI } from '../../../services/wallet/types'
import { WalletSelector as Component, Props } from './WalletSelector'

export const Default: StoryFn<Props> = (args) => <Component {...args} />

const wallets: KeystoreWalletsUI = [
  { id: 0, name: 'wallet 0', selected: false },
  { id: 1, name: 'wallet 1', selected: false },
  { id: 2, name: 'wallet 2', selected: true },
  { id: 3, name: 'wallet 3', selected: false }
]

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/WalletSelector',
  decorators: [
    (Story) => (
      <div className="flex h-full w-full items-center justify-center">
        <Story />
      </div>
    )
  ],
  argTypes: {
    onChange: { action: 'onChange' },
    wallets: {
      options: ['list', 'empty', 'no-selected'],
      mapping: {
        list: wallets,
        empty: [],
        'no-selected': wallets.map((wallet) => ({ ...wallet, selected: false }))
      }
    }
  },
  args: {
    wallets: [],
    disabled: false
  }
}

export default meta
