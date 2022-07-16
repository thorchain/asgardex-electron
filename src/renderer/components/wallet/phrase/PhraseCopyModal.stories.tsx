import { ComponentMeta, StoryFn } from '@storybook/react'

import { MOCK_PHRASE } from '../../../../shared/mock/wallet'
import { PhraseCopyModal as Component, Props } from './PhraseCopyModal'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/PhraseCopyModal',
  argTypes: {
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
    phrase: MOCK_PHRASE
  }
}

export default meta
