import { ComponentMeta } from '@storybook/react'

import { Footer as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Footer',
  argTypes: {
    isDev: {
      name: 'is dev',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    commitHash: {
      name: 'hash',
      control: {
        type: 'text'
      },
      defaultValue: 'e69bea54b8228aff6d6bcf4bca6c1de07ac07c90'
    }
  }
}

export default meta
