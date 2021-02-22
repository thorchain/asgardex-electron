import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees } from '@xchainjs/xchain-client'
import { FeesParams } from '@xchainjs/xchain-ethereum'
import { assetAmount, AssetETH, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
import { Props as SendFormETHProps } from './SendFormETH'

const ethBalance: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetETH wallet address'
}

const runeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2)),
  walletAddress: 'rune wallet address'
}

const fees: Fees = {
  type: 'byte',
  fastest: assetToBase(assetAmount(0.002499)),
  fast: assetToBase(assetAmount(0.002079)),
  average: assetToBase(assetAmount(0.001848))
}

const defaultProps: SendFormETHProps = {
  balances: [ethBalance, runeBalance],
  balance: ethBalance,
  fees: RD.success(fees),
  reloadFeesHandler: (p: FeesParams) => console.log('reloadFeesHandler', p),
  validatePassword$: mockValidatePassword$,
  onSubmit: (p: SendTxParams) => {
    console.log('transfer$:', p)
  },
  isLoading: false,
  sendTxStatusMsg: '',
  network: 'testnet'
}

export const Default: Story = () => <SendFormETH {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: SendFormETHProps = {
    ...defaultProps,
    isLoading: true,
    sendTxStatusMsg: 'step 1 / 2'
  }
  return <SendFormETH {...props} />
}
Pending.storyName = 'pending'

export const FeesInitial: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, fees: RD.initial }
  return <SendFormETH {...props} />
}
FeesInitial.storyName = 'fees initial'

export const FeesLoading: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, fees: RD.pending }
  return <SendFormETH {...props} />
}
FeesLoading.storyName = 'fees loading'

export const FeesFailure: Story = () => {
  const props: SendFormETHProps = {
    ...defaultProps,
    fees: RD.failure(Error('Could not load fees for any reason'))
  }
  return <SendFormETH {...props} />
}
FeesFailure.storyName = 'fees failure'

const meta: Meta = {
  component: SendFormETH,
  title: 'Wallet/SendFormETH'
}

export default meta
