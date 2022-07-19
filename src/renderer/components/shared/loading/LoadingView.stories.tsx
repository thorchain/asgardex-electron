import { ComponentMeta, StoryFn } from '@storybook/react'

import { LoadingView as Component, Props } from './LoadingView'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/LoadingView',
  args: {
    label: 'Loading data!'
  }
}

export default meta
