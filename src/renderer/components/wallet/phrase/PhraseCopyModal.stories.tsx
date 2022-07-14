import { ComponentMeta } from '@storybook/react'

import { PhraseCopyModal as Component } from './PhraseCopyModal'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Phrase/Copy',
  argTypes: {
    visible: {
      name: 'visible',
      control: {
        type: 'boolean'
      },
      defaultValue: true
    },
    phrase: {
      name: 'phrase',
      control: {
        type: 'text'
      },
      defaultValue: 'rural bright ball negative already grass good grant nation screen model pizza'
    }
  },
  args: {
    onClose: () => console.log('onClose')
  }
}

export default meta
