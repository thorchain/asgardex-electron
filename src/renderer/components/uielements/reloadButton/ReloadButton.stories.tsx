import { ComponentMeta } from '@storybook/react'

import { ReloadButton as Component } from './'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/ReloadButton',
  argTypes: {
    children: {
      control: {
        options: ['none', 'text'],
        mapping: {
          none: null,
          text: 'Reload child text'
        }
      },
      defaultValue: 'text'
    }
  }
}

export default meta
