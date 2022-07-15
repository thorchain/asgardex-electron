import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { baseAmount, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'

import { Fees, Props as FeesProps } from './Fees'

const baseFee = {
  amount: baseAmount('31500'),
  asset: AssetRuneNative
}

const defaultProps: FeesProps = {
  fees: RD.success([baseFee]),
  reloadFees: () => console.log('reload fees'),
  disabled: false
}

export const Default: Story = () => <Fees {...defaultProps} />
Default.storyName = 'default'

export const Multiple: Story = () => {
  const props: FeesProps = {
    ...defaultProps,
    fees: RD.success([
      baseFee,
      {
        amount: baseAmount('1750'),
        asset: AssetBTC
      }
    ])
  }
  return <Fees {...props} />
}
Multiple.storyName = 'multiple fees'

export const Loading: Story = () => {
  const props: FeesProps = {
    ...defaultProps,
    fees: RD.pending
  }
  return <Fees {...props} />
}
Loading.storyName = 'loading'

export const NoReload: Story = () => {
  const props: FeesProps = {
    ...defaultProps,
    reloadFees: undefined
  }
  return <Fees {...props} />
}
NoReload.storyName = 'no reload'

export const Disabled: Story = () => {
  const props: FeesProps = {
    ...defaultProps,
    disabled: true
  }
  return <Fees {...props} />
}
Disabled.storyName = 'disabled'

export const FeeError: Story = () => {
  const props: FeesProps = {
    ...defaultProps,
    fees: RD.failure(Error('Fee error'))
  }
  return <Fees {...props} />
}
FeeError.storyName = 'error'

const meta: Meta = {
  component: Fees,
  title: 'Components/Fees'
}

export default meta
