import { ComponentMeta, StoryFn } from '@storybook/react'

import { HeaderSettings as Component, Props } from './HeaderSettings'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderSettings',
  argTypes: { onPress: { action: 'onPress' } },
  args: { isDesktopView: false }
}

export default meta
