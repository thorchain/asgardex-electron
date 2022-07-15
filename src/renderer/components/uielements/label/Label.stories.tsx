import { ComponentMeta } from '@storybook/react'

import { Label as Component } from './Label'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Label',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['tiny', 'small', 'normal', 'big', 'large']
      },
      defaultValue: 'normal'
    },
    weight: {
      control: {
        type: 'select',
        options: ['light', 'bold', 'normal']
      },
      defaultValue: 'normal'
    },
    color: {
      control: {
        type: 'select',
        options: ['primary', 'success', 'warning', 'error', 'normal', 'light', 'dark', 'input', 'gray', 'white']
      },
      defaultValue: 'normal'
    },
    children: {
      control: {
        type: 'text'
      },
      defaultValue: 'Label Text'
    }
  }
}

export default meta
