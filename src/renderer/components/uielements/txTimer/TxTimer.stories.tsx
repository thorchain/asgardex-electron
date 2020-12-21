import React from 'react'

import { Meta, Story } from '@storybook/react'
// import * as Rx from 'rxjs'
// import * as RxOp from 'rxjs/operators'

import { TxTimer, Props as TxTimerProps } from './TxTimer'

const meta: Meta = {
  title: 'Components/TxTimer',
  component: TxTimer
}

export default meta

// const timer$ = (max = 100) => Rx.interval(1000).pipe(RxOp.takeUntil(Rx.timer(max * 1000)))
// let value = 0
// timer$().subscribe((v) => (value = v))

const Template: Story<TxTimerProps> = (args) => <TxTimer {...args} />

export const _Story1 = Template.bind({})

const Story1: Story<TxTimerProps> = (args) => <TxTimer {...args} />
Story1.args = {
  status: true,
  value: 22,
  maxValue: 100
}
Story1.argTypes = {
  status: { control: 'boolean' },
  value: { control: 'number' }
}

Story1.storyName = 'dynamic values'
