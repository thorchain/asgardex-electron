import { ComponentMeta } from '@storybook/react'

import { ReloadButton as Component } from './'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/ReloadButton',
  argTypes: {
    children: {
      options: ['none', 'text'],
      mapping: {
        none: null,
        text: 'Reload child text'
      }
    }
  },
  args: { children: 'text' }
}

export default meta
