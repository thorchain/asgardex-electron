import { ComponentMeta, StoryFn } from '@storybook/react'

import { Button } from '../../uielements/button'
import { SuccessView as Component, Props } from './SuccessView'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const renderActionButton = () => (
  <Button onClick={() => console.log('action')} typevalue="outline">
    Click me
  </Button>
)

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/SuccessView',
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
    title: 'Data loaded successfully!',
    extra: null
  }
}

export default meta
