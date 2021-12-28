import React from 'react'

import { Meta, Story, storiesOf } from '@storybook/react'

import { StepBar, Props as StepBarProps } from './index'

storiesOf('Components/StepBar', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <StepBar />
    </div>
  )
})

const Template: Story<StepBarProps> = (args) => <StepBar {...args} />

export const StoryDefault: Story = Template.bind({})
StoryDefault.storyName = 'default'

export const StorySize: Story = Template.bind({})
StorySize.args = {
  size: 100
}
StorySize.storyName = 'dynamic size'

const meta: Meta = {
  component: StepBar,
  title: 'Components/StepBar',
  decorators: [
    (S: Story) => (
      <div style={{ padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
