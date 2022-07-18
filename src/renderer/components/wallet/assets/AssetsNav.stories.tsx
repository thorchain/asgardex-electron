import { ComponentMeta, StoryFn } from '@storybook/react'

import { AssetsNav as Component } from './AssetsNav'

const Template: StoryFn = () => <Component />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Wallet/AssetsNav'
}

export default meta
