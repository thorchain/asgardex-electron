import { ComponentMeta, StoryFn } from '@storybook/react'

import { InputSearch as Component, Props } from './InputSearch'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/InputSearch',
  argTypes: {
    onChange: {
      action: 'onChange'
    },
    onCancel: {
      action: 'onCancel'
    },
    onSearch: {
      action: 'onSearch'
    },
    size: {
      control: { type: 'select', options: ['small', 'medium', 'normal', 'large'] }
    }
  },
  args: {
    placeholder: 'Search',
    size: 'normal',
    error: false,
    disabled: false
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-white p-20">
        <Story />
      </div>
    )
  ]
}

export default meta
