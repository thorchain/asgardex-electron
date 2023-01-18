import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { baseAmount } from '@xchainjs/xchain-util'

import { AssetBTC, AssetRuneNative } from '../../../../shared/utils/asset'
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

export const Default: StoryFn<FeesProps> = () => <Fees {...defaultProps} />

export const Multiple: StoryFn<FeesProps> = () => {
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

export const Loading: StoryFn<FeesProps> = () => {
  const props: FeesProps = {
    ...defaultProps,
    fees: RD.pending
  }
  return <Fees {...props} />
}

export const NoReload: StoryFn<FeesProps> = () => {
  const props: FeesProps = {
    ...defaultProps,
    reloadFees: undefined
  }
  return <Fees {...props} />
}

export const Disabled: StoryFn<FeesProps> = () => {
  const props: FeesProps = {
    ...defaultProps,
    disabled: true
  }
  return <Fees {...props} />
}

export const FeeError: StoryFn<FeesProps> = () => {
  const props: FeesProps = {
    ...defaultProps,
    fees: RD.failure(Error('Fee error'))
  }
  return <Fees {...props} />
}

const meta: ComponentMeta<typeof Fees> = {
  component: Fees,
  title: 'Components/Fees'
}

export default meta
