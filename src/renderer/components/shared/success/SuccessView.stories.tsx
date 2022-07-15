import { ComponentMeta } from '@storybook/react'

import { Button } from '../../uielements/button'
import { SuccessView as Component } from './index'

const renderActionButton = () => (
  <Button onClick={() => console.log('action')} typevalue="outline">
    Click me
  </Button>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/SuccessView',
  argTypes: {
    title: {
      name: 'title',
      control: {
        type: 'text'
      },
      defaultValue: 'Data loaded successfully!'
    },
    extra: {
      options: ['null', 'extra'],
      mapping: {
        null: null,
        extra: renderActionButton()
      }
    }
  }
}

export default meta
