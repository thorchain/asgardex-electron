import { ComponentMeta, StoryFn } from '@storybook/react'

import { InfoIcon as Component, Props } from './InfoIcon'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/InfoIcon',
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
      },
      defaultValue: 'primary'
    }
  },
  args: {
    tooltip: 'Tooltip example text'
  }
}

export default meta
