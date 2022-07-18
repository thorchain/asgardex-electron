import { SyncOutlined } from '@ant-design/icons'
import { ComponentMeta, StoryFn } from '@storybook/react'

import { Button } from '../button'
import { ButtonColor } from '../button/Button.types'
import { Alert as Component, Props } from './Alert'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const description = <div>This is a description message.</div>

const renderActionButton = (color: ButtonColor) => (
  <div>
    <p>{description}</p>
    <Button onClick={() => console.log('action')} typevalue="outline" color={color}>
      <SyncOutlined />
      Action Button
    </Button>
  </div>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Alert',
  decorators: [
    (Story) => (
      <div style={{ padding: '15px' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    type: {
      name: 'type',
      control: {
        type: 'select',
        options: ['success', 'info', 'warning', 'error']
      }
    },
    message: {
      options: ['text', 'jsx'],
      mapping: {
        text: description,
        jsx: renderActionButton('primary')
      }
    }
  },
  args: {
    type: 'success',
    message: description
  }
}

export default meta
