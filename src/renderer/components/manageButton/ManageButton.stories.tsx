import { ComponentMeta, StoryFn } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'

import { ManageButton as Component, Props } from './ManageButton'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  title: 'Components/ManageButton',
  argTypes: {
    sizevalue: {
      control: {
        type: 'select',
        options: ['small', 'normal', 'xnormal', 'big']
      }
    }
  },
  args: {
    isTextView: true,
    asset: AssetRuneNative,
    disabled: false,
    sizevalue: 'normal'
  }
}

export default meta
