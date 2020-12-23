import React from 'react'

import { Meta, Story } from '@storybook/react'

import { TxTimer, Props as TxTimerProps } from './TxTimer'

const meta: Meta = {
  title: 'Components/TxTimer',
  component: TxTimer
}

export default meta

const Template: Story<TxTimerProps> = (args) => <TxTimer {...args} />

export const StoryInitial: Story = () => <TxTimer status startTime={NaN} />
StoryInitial.storyName = 'initial'

export const StoryFinished: Story = () => <TxTimer status={false} startTime={NaN} />
StoryFinished.storyName = 'finished'

export const StoryDynamic = Template.bind({})
StoryDynamic.args = {
  status: true,
  value: NaN,
  interval: 1000,
  maxValue: 100,
  startTime: Date.now()
}
StoryDynamic.storyName = 'dynamic vbalues'

export const StoryStatic: Story = () => <TxTimer value={NaN} status startTime={Date.now()} />
StoryStatic.storyName = 'static values'
