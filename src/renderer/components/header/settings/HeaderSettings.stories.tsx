import { ComponentMeta } from '@storybook/react'

import { HeaderSettings as Component } from './HeaderSettings'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderSettings',
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
