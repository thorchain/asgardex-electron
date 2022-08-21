import { ComponentMeta, StoryFn } from '@storybook/react'

import { AppUpdate as Component, AppUpdateModalProps as Props } from './AppUpdate'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/AppUpdate',
  argTypes: {
    goToUpdates: {
      action: 'goToUpdates'
    },
    close: {
      action: 'close'
    }
  },
  args: {
    isOpen: true,
    version: 'test version'
  }
}

export default meta
