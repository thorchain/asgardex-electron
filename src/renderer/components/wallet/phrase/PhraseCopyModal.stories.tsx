import { ComponentMeta, StoryFn } from '@storybook/react'

import { PhraseCopyModal as Component, Props } from './PhraseCopyModal'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/PhraseCopyModal',
  argTypes: {
    visible: {
      name: 'visible',
      control: {
        type: 'boolean'
      }
    },
    phrase: {
      name: 'phrase',
      control: {
        type: 'text'
      }
    },
    onClose: { action: 'onClose' }
  },
  args: {
    visible: true,
    phrase: 'rural bright ball negative already grass good grant nation screen model pizza'
  }
}

export default meta
