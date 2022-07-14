import { ComponentMeta } from '@storybook/react'

import { LoadingView as Component } from './LoadingView'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/LoadingView',
  argTypes: {
    label: {
      name: 'label',
      control: {
        type: 'text'
      },
      defaultValue: 'Loading data!'
    }
  }
}

export default meta
