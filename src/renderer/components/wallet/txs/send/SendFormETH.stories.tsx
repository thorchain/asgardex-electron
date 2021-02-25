import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees } from '@xchainjs/xchain-client'
import { ETH_DECIMAL, FeesParams } from '@xchainjs/xchain-ethereum'
import { assetAmount, AssetETH, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { THORCHAIN_DECIMAL } from '../../../../helpers/assetHelper'
import { SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
import { Props as SendFormETHProps } from './SendFormETH'

const ethBalance: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(1.23, ETH_DECIMAL)),
  walletAddress: 'AssetETH wallet address'
}

const runeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2, THORCHAIN_DECIMAL)),
  walletAddress: 'rune wallet address'
}

const fees: Fees = {
  type: 'byte',
  fastest: assetToBase(assetAmount(0.002499, ETH_DECIMAL)),
  fast: assetToBase(assetAmount(0.002079, ETH_DECIMAL)),
  average: assetToBase(assetAmount(0.001848, ETH_DECIMAL))
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
