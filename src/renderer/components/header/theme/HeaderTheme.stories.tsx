import { ComponentMeta } from '@storybook/react'

import { HeaderTheme as Component } from './HeaderTheme'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderTheme',
  argTypes: {
    isDesktopView: {
      name: 'isDesktopView',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  }
}

export default meta
