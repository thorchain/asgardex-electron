import { ComponentMeta } from '@storybook/react'

import { Pagination as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Pagination',
  argTypes: {
    defaultCurrent: {
      name: 'current',
      control: {
        type: 'number'
      },
      defaultValue: 1
    },
    total: {
      control: {
        type: 'number'
      },
      defaultValue: 100
    },
    defaultPageSize: {
      control: {
        type: 'number'
      },
      defaultValue: 5
    },
    showSizeChanger: {
      name: 'Loading state',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onChange: { action: 'onChange' }
  }
}

export default meta
