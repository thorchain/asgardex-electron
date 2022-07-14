import { ComponentMeta } from '@storybook/react'

import { ContentTitle as Component } from './ContentTitle'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/ContentTitle',
  argTypes: {
    children: {
      name: 'title',
      control: {
        type: 'text'
      },
      defaultValue: 'you are swapping'
    }
  }
}

export default meta
