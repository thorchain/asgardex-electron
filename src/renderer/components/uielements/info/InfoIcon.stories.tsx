import { ComponentMeta } from '@storybook/react'

import { InfoIcon as Component } from './InfoIcon'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/InfoIcon',
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
      },
      defaultValue: 'primary'
    },
    tooltip: {
      control: {
        type: 'text'
      },
      defaultValue: 'Tooltip example text'
    }
  }
}

export default meta
