import { ComponentMeta, StoryFn } from '@storybook/react'

import { Footer as Component, Props } from './Footer'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Footer',
  args: {
    isDev: false,
    commitHash: 'e69bea54b8228aff6d6bcf4bca6c1de07ac07c90'
  }
}

export default meta
