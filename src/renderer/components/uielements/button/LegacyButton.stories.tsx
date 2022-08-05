import { ComponentMeta, StoryFn } from '@storybook/react'

import { Button as Component } from './Button'
import type { ButtonProps } from './Button.types'

const Template: StoryFn<ButtonProps> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/LegacyButton',
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
    }
  },
  args: {
    children: 'Button label',
    typevalue: 'default',
    color: 'primary',
    sizevalue: 'normal',
    focused: false,
    loading: false
  }
}

export default meta
