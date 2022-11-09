import { ComponentMeta, StoryFn } from '@storybook/react'

import { BackLinkButton as Component, Props } from './BackLinkButton'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/BackLinkButton',
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
