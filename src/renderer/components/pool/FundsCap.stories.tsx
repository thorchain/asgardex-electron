import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { FundsCap as Component, Props as ComponentProps } from './FundsCap'

const defaultProps: ComponentProps = {
  fundsCap: RD.success(
    O.some({
      reached: false,
      pooledRuneAmount: assetToBase(assetAmount(100)),
      maxPooledRuneAmount: assetToBase(assetAmount(200))
    })
  )
}
export const Default: Story = () => <Component {...defaultProps} />
Default.storyName = 'default'

export const Loading: Story = () => {
  const props: ComponentProps = {
    ...defaultProps,
    fundsCap: RD.pending
  }
  return <Component {...props} />
}
Loading.storyName = 'loading'

const meta: Meta = {
  component: Component,
  title: 'FundsCap'
}

export default meta
