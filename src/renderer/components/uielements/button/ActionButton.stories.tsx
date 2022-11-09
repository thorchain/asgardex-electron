import { ComponentMeta, StoryFn } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetETH, AssetLTC, AssetRuneB1A, AssetRuneNative } from '@xchainjs/xchain-util'

import { Actionbutton as Component, Props } from './ActionButton'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  title: 'Components/button/ActionButton',
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'normal', 'large']
      }
    }
  },
  args: {
    actions: [
      { type: 'swap', data: { target: AssetRuneNative, source: AssetBNB } },
      { type: 'manage', data: { asset: AssetBNB } },
      { type: 'savers', data: { asset: AssetBTC } },
      { type: 'send', data: { asset: AssetETH } },
      { type: 'deposit', data: { asset: AssetLTC } },
      { type: 'upgrade', data: { asset: AssetRuneB1A } }
    ],
    disabled: false,
    size: 'normal'
  },
  decorators: [
    (Story) => (
      <div className="flex h-full w-full items-center justify-center">
        <Story />
      </div>
    )
  ]
}

export default meta
