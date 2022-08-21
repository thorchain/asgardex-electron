import { ComponentMeta } from '@storybook/react'

import { Button as Component } from './Button'
import { ButtonProps } from './Button.types'

export const LegacyButton = ({ typevalue, sizevalue, color, focused, children }: ButtonProps) => (
  <Component typevalue={typevalue} sizevalue={sizevalue} color={color} focused={focused}>
    {children}
  </Component>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/ButtonLegacy',
  argTypes: {
    typevalue: {
      control: {
        type: 'select',
        options: ['default', 'outline', 'normal', 'ghost', 'transparent', 'underline']
      }
    },
    sizevalue: {
      name: 'size',
      control: {
        type: 'select',
        options: ['small', 'normal', 'xnormal', 'big']
      }
    },
    color: {
      name: 'color',
      control: {
        type: 'select',
        options: ['primary', 'success', 'warning', 'error']
      }
    },
    focused: {
      control: {
        type: 'boolean'
      }
    },
    children: {
      control: {
        type: 'text'
      }
    }
  },
  args: {
    children: 'Button label',
    focused: false,
    color: 'primary',
    sizevalue: 'normal',
    typevalue: 'default'
  }
}

export default meta
