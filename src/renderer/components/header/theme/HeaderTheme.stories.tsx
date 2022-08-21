import { ComponentMeta, StoryFn } from '@storybook/react'

import { HeaderTheme as Component, Props } from './HeaderTheme'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderTheme',
  argTypes: {
    onPress: { action: 'onPress' }
  },
  args: {
    isDesktopView: false
  }
}

export default meta
