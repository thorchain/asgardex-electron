import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees } from '@xchainjs/xchain-client'
import { FeesParams } from '@xchainjs/xchain-ethereum'
import { assetAmount, AssetETH, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { INITIAL_SEND_STATE } from '../../../../services/chain/const'
import { SendTxState, SendTxState$ } from '../../../../services/chain/types'
import { SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
import { Props as SendFormETHProps } from './SendFormETH'

const mockTxState$ = (states: SendTxState[]): SendTxState$ =>
  Rx.interval(1000).pipe(
    // stop interval stream if we don't have state in states anymore
    RxOp.takeWhile((value) => !!states[value]),
    RxOp.map((value) => states[value]),
    RxOp.startWith(INITIAL_SEND_STATE)
  )

const ethAsset: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetETH wallet address'
}

const runeAsset: WalletBalance = {
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

// total steps
const total = 2

const defaultProps: SendFormETHProps = {
  balances: [ethAsset, runeAsset],
  balance: ethAsset,
  fees: RD.success(fees),
  reloadFeesHandler: (p: FeesParams) => console.log('reloadFeesHandler', p),
  validatePassword$: mockValidatePassword$,
  transfer$: (p: SendTxParams): SendTxState$ => {
    console.log('transfer$:', p)
    return mockTxState$([
      { steps: { current: 1, total }, status: RD.pending },
      { steps: { current: 2, total }, status: RD.pending },
      { steps: { current: 2, total }, status: RD.success('tx-hash') }
    ])
  },
  successActionHandler: (txHash) => {
    console.log('success handler ' + txHash)
    return Promise.resolve(undefined)
  },
  reloadBalancesHandler: () => console.log('reload balances'),
  network: 'testnet'
}

export const Default: Story = () => <SendFormETH {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: SendFormETHProps = {
    ...defaultProps,
    transfer$: (_: SendTxParams): SendTxState$ =>
      mockTxState$([
        {
          steps: { current: 1, total },
          status: RD.pending
        }
      ])
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
    fees: RD.failure(Error('Could not load fee and rates for any reason'))
  }
  return <SendFormETH {...props} />
}
FeesFailure.storyName = 'fees failure'

const meta: Meta = {
  component: SendFormETH,
  title: 'Wallet/SendFormETH'
}

export default meta
