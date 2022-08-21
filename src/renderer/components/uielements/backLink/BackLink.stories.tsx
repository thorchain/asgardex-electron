import { ComponentMeta, StoryFn } from '@storybook/react'

import { BackLink as Component, Props } from './BackLink'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/BackLink',
  args: {
    label: 'Back link'
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '15px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
