import { ComponentMeta } from '@storybook/react'

import { AppUpdate as Component } from './AppUpdate'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'AppUpdate',
  argTypes: {
    isOpen: {
      control: {
        type: 'boolean'
      },
      defaultValue: true
    },
    goToUpdates: {
      action: 'goToUpdates'
    },
    close: {
      action: 'close'
    },
    version: {
      control: 'text',
      defaultValue: 'test version'
    }
  }
}

export default meta
