import { ComponentMeta } from '@storybook/react'

import { Selection as Component } from './Selection'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Selection',
  argTypes: {
    selected: { control: { type: 'number' }, defaultValue: 0 },
    onSelect: {
      action: 'onSelect'
    }
  }
}

export default meta
