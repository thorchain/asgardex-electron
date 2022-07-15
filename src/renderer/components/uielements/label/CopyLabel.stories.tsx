import { ComponentMeta } from '@storybook/react'

import { CopyLabel as Component } from './CopyLabel'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/CopyLabel',
  argTypes: {
    label: {
      name: 'label',
      control: {
        type: 'text'
      },
      defaultValue: 'label'
    },
    textToCopy: {
      name: 'textToCopy',
      control: {
        type: 'text'
      },
      defaultValue: 'text to copy'
    }
  }
}

export default meta
