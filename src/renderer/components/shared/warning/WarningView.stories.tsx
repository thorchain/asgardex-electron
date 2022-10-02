import { SyncOutlined } from '@ant-design/icons'
import { ComponentMeta, StoryFn } from '@storybook/react'

import { Button } from '../../uielements/button'
import { WarningView as Component, Props } from './WarningView'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const renderActionButton = () => (
  <Button onClick={() => console.log('action')} typevalue="outline">
    <SyncOutlined />
    Action Button
  </Button>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/WarningView',
  argTypes: {
    extra: {
      options: ['null', 'extra'],
      mapping: {
        null: null,
        extra: renderActionButton()
      }
    }
  },
  args: {
    title: 'Warning message!',
    extra: null
  }
}

export default meta
