import * as RD from '@devexperts/remote-data-ts'
import { Meta, StoryFn } from '@storybook/react'
import { baseAmount } from '@xchainjs/xchain-util'

import { IncentivePendulum as Component, Props } from './IncentivePendulum'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const meta: Meta = {
  component: Component,
  title: 'Components/IncentivePendulum',
  argTypes: {
    incentivePendulum: {
      options: ['init', 'loading', 'error', 'success'],
      mapping: {
        init: RD.initial,
        loading: RD.pending,
        error: RD.failure(Error('Failed to get data for incentive pendulum')),
        success: RD.success({
          totalActiveBondAmount: baseAmount(1000),
          totalPooledRuneAmount: baseAmount(800),
          incentivePendulum: 90,
          incentivePendulumLight: 'green'
        })
      }
    }
  },
  args: {
    incentivePendulum: RD.pending
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '30px'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta
