import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import {
  assetAmount,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { SendTxParams } from '../../../../services/chain/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { SendFormTHOR as Component, Props as ComponentProps } from './SendFormTHOR'

const runeBalance: WalletBalance = mockWalletBalance({
  amount: assetToBase(assetAmount(2))
})

const defaultProps: ComponentProps = {
  walletType: 'keystore',
  walletIndex: 0,
  balances: [runeBalance],
  balance: runeBalance,
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) =>
    console.log(
      `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
        asset
      )}, memo: ${memo}`
    ),
  isLoading: false,
  addressValidation: (_) => true,
  fee: RD.success(baseAmount(1000)),
  reloadFeesHandler: () => console.log('reload fees'),
  validatePassword$: mockValidatePassword$,
  sendTxStatusMsg: '',
  network: 'testnet'
}

export const Default: Story = () => <Component {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: ComponentProps = { ...defaultProps, isLoading: true, sendTxStatusMsg: 'Step 1/2' }
  return <Component {...props} />
}
Pending.storyName = 'pending'

export const NoFees: Story = () => {
  const props: ComponentProps = { ...defaultProps, fee: RD.failure(Error('no fees')) }
  return <Component {...props} />
}
NoFees.storyName = 'no fees'

export const FeeNotCovered: Story = () => {
  const props: ComponentProps = { ...defaultProps, balances: [{ ...runeBalance, amount: baseAmount(30) }] }
  return <Component {...props} />
}
FeeNotCovered.storyName = 'fees not covered'

const meta: Meta = {
  component: Component,
  title: 'Wallet/SendFormTHOR'
}

export default meta
