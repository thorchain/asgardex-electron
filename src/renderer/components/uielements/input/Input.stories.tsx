import { ComponentMeta, StoryFn } from '@storybook/react'

import { Input as Component, InputProps } from './Input'

const Template: StoryFn<InputProps> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Input',
  argTypes: {
    onChange: {
      action: 'onChange'
    },
    size: {
      control: { type: 'select', options: ['small', 'normal', 'large'] }
    }
  },
  args: {
    placeholder: 'Placeholder',
    error: '',
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
