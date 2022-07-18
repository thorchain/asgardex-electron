import { ComponentMeta, StoryFn } from '@storybook/react'

import { StepBar as Component, Props } from './index'

export const Default: StoryFn<Props> = (args) => <Component {...args} />

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/StepBar',
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    )
  ],
  args: {
    size: 100
  }
}

export default meta
