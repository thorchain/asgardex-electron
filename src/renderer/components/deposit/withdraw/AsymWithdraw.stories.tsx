import { Story, Meta } from '@storybook/react'

import { AsymWithdraw, Props as AsymWithdrawProps } from './AsymWithdraw'

const defaultProps: AsymWithdrawProps = {}

export const Default: Story = () => <AsymWithdraw {...defaultProps} />
Default.storyName = 'default'

const meta: Meta = {
  component: AsymWithdraw,
  title: 'Components/Withdraw/AsymWithdraw'
}

export default meta
