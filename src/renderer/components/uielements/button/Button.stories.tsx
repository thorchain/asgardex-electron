import { ComponentMeta } from '@storybook/react'

import { Button as Component } from './Button'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Button',
  argTypes: {
    typevalue: {
      control: {
        type: 'select',
        options: ['default', 'outline', 'normal', 'ghost', 'transparent', 'underline']
      },
      defaultValue: 'default'
    },
    sizevalue: {
      name: 'size',
      control: {
        type: 'select',
        options: ['small', 'normal', 'xnormal', 'big']
      },
      defaultValue: 'normal'
    },
    color: {
      name: 'color',
      control: {
        type: 'select',
        options: ['primary', 'success', 'warning', 'error']
      },
      defaultValue: 'primary'
    },
    focused: {
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    children: {
      control: {
        type: 'text'
      },
      defaultValue: 'Button label'
    }
  }
}

export default meta
