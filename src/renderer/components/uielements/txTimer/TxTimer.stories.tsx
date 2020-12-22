import React from 'react'

import { Meta, Story } from '@storybook/react'

import { TxTimer, Props as TxTimerProps } from './TxTimer'

const meta: Meta = {
  title: 'Components/TxTimer',
  component: TxTimer
}

export default meta

const Template: Story<TxTimerProps> = (args) => <TxTimer {...args} />

export const Story1 = Template.bind({})
Story1.args = {
  status: true,
  value: NaN,
  interval: 1000,
  maxValue: 100,
  startTime: Date.now()
}
Story1.storyName = 'dynamic values'

export const Story2: Story = () => <TxTimer value={NaN} status startTime={Date.now()} />
Story2.storyName = 'static values'
