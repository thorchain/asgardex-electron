import { ComponentMeta, StoryFn } from '@storybook/react'

import { CopyLabel as Component } from './CopyLabel'

type ArgTypes = {
  label: string
  textToCopy: string
}

const Template: StoryFn<ArgTypes> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/CopyLabel',
  args: {
    label: 'label',
    textToCopy: 'text to copy'
  }
}

export default meta
