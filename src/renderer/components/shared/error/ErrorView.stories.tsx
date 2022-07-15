import { SyncOutlined } from '@ant-design/icons'
import { ComponentMeta } from '@storybook/react'

import { Button } from '../../uielements/button'
import { ErrorView as Component } from './index'

const renderActionButton = () => (
  <Button onClick={() => console.log('action')} typevalue="outline">
    <SyncOutlined />
    Action Button
  </Button>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/ErrorView',
  argTypes: {
    title: {
      name: 'title',
      control: {
        type: 'text'
      },
      defaultValue: 'Error while loading data!'
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
