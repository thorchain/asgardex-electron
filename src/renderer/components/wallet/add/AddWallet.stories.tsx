import { ComponentMeta } from '@storybook/react'

import { AddWallet as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/AddWallet',
  argTypes: {
    isLocked: {
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  }
}

export default meta
