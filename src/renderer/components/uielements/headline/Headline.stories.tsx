import { ComponentMeta } from '@storybook/react'

import { Headline as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Headline',
  argTypes: {
    children: {
      name: 'title',
      control: {
        type: 'text'
      },
      defaultValue: 'Hello headline'
    }
  }
}

export default meta
