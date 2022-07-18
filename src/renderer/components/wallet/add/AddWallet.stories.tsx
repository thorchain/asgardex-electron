import { ComponentMeta, StoryFn } from '@storybook/react'

import { AddWallet as Component, Props } from './AddWallet'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/AddWallet',
  args: {
    isLocked: false
  }
}

export default meta
