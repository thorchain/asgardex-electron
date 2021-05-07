import { Story, Meta } from '@storybook/react'

import { AsymDeposit, Props as AsymDepositProps } from './AsymDeposit'

const defaultProps: AsymDepositProps = {}

export const Default: Story = () => <AsymDeposit {...defaultProps} />
Default.storyName = 'default'

const meta: Meta = {
  component: AsymDeposit,
  title: 'Components/Deposit/AsymDeposit'
}

export default meta
