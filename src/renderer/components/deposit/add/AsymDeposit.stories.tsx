import { ComponentMeta, StoryFn } from '@storybook/react'

import { AsymDeposit as Component, Props } from './AsymDeposit'

const Template: StoryFn<Props> = (args = {}) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Deposit/AsymDeposit'
}

export default meta
