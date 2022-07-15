import { ComponentMeta } from '@storybook/react'

import { TxTimer } from './TxTimer'

const meta: ComponentMeta<typeof TxTimer> = {
  title: 'Components/TxTimer',
  component: TxTimer,
  argTypes: {
    status: {
      control: 'boolean',
      defaultValue: true
    },
    startTime: {
      options: ['none', 'now'],
      mapping: {
        none: NaN,
        now: Date.now()
      }
    }
  },
  args: {
    interval: 1000,
    maxValue: 100
  }
}

export default meta
