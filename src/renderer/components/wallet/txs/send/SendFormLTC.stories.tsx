import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees, FeeRates, FeeType } from '@xchainjs/xchain-client'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import {
  assetAmount,
  AssetLTC,
  AssetRuneNative,
  assetToBase,
  baseAmount,
  formatBaseAmount
} from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { SendTxParams } from '../../../../services/chain/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { SendFormLTC as Component, Props as ComponentProps } from './SendFormLTC'

const ltcBalance: WalletBalance = {
  asset: AssetLTC,
  amount: assetToBase(assetAmount(1.23, LTC_DECIMAL)),
  walletAddress: 'btc wallet address'
}

const runeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2, LTC_DECIMAL)),
  walletAddress: 'rune wallet address'
}

const fees: Fees = {
  type: FeeType.FlatFee,
  fastest: baseAmount(3000),
  fast: baseAmount(2000),
  average: baseAmount(1000)
}

const rates: FeeRates = {
  fastest: 5,
  fast: 3,
  average: 2
}

const defaultProps: ComponentProps = {
  balances: [ltcBalance, runeBalance],
  balance: ltcBalance,
  onSubmit: ({ recipient, amount, feeOption, memo }: SendTxParams) =>
    console.log(`to: ${recipient}, amount ${formatBaseAmount(amount)}, feeOptionKey: ${feeOption}, memo: ${memo}`),
  isLoading: false,
  addressValidation: (_) => true,
  feesWithRates: RD.success({ fees, rates }),
  reloadFeesHandler: () => console.log('reload fees'),
  validatePassword$: mockValidatePassword$,
  sendTxStatusMsg: '',
  network: 'testnet'
}

export const Default: Story = () => <Component {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: ComponentProps = {
    ...defaultProps,
    isLoading: true,
    sendTxStatusMsg: 'step 1 / 2'
  }
  return <Component {...props} />
}
Pending.storyName = 'pending'

export const FeesInitial: Story = () => {
  const props: ComponentProps = { ...defaultProps, feesWithRates: RD.initial }
  return <Component {...props} />
}
FeesInitial.storyName = 'fees initial'

export const FeesLoading: Story = () => {
  const props: ComponentProps = { ...defaultProps, feesWithRates: RD.pending }
  return <Component {...props} />
}
FeesLoading.storyName = 'fees loading'

export const FeesFailure: Story = () => {
  const props: ComponentProps = {
    ...defaultProps,
    feesWithRates: RD.failure(Error('Could not load fees and rates for any reason'))
  }
  return <Component {...props} />
}
FeesFailure.storyName = 'fees failure'

export const FeesNotCovered: Story = () => {
  const props: ComponentProps = {
    ...defaultProps,
    balance: { ...ltcBalance, amount: baseAmount(1, LTC_DECIMAL) }
  }
  return <Component {...props} />
}
FeesNotCovered.storyName = 'fees not covered'

const meta: Meta = {
  component: Component,
  title: 'Wallet/SendFormLTC'
}

export default meta
