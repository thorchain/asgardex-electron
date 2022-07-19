import { SyncOutlined } from '@ant-design/icons'
import { ComponentMeta, StoryFn } from '@storybook/react'

import { Button } from '../../uielements/button'
import { ErrorView as Component, Props } from './ErrorView'

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
  title: 'Components/ErrorView',
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
    title: 'Error while loading data!',
    extra: null
  }
}

export default meta
