import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase, baseAmount, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { WithdrawState } from '../../../services/chain/types'
import { Withdraw, Props as WitdrawProps } from './Withdraw'

const runeBalance = O.some(assetToBase(assetAmount(100)))

const assetPoolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}

const chainAssetPoolData = {
  assetBalance: baseAmount('1000'),
  runeBalance: baseAmount('2000')
}

const defaultProps: WitdrawProps = {
  fees: RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(3000), assetOut: baseAmount(3000) }),
  asset: AssetBNB,
  assetPoolData: assetPoolData,
  assetPrice: bn(60.972),
  chainAssetPoolData: chainAssetPoolData,
  runePrice: bn(1),
  runeBalance: runeBalance,
  selectedPriceAsset: AssetRuneNative,
  onWithdraw: console.log,
  shares: { rune: baseAmount('193011422'), asset: baseAmount('3202499') },
  reloadFees: () => console.log('reload fees'),
  // mock successfull result of withdraw$
  withdraw$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('deposit$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<WithdrawState>({
          ...INITIAL_WITHDRAW_STATE,
          step: 4,
          withdrawTx: RD.success('rune-tx-hash'),
          withdraw: RD.success(true)
        })
      )
    )
}

export const Default: Story = () => <Withdraw {...defaultProps} />
Default.storyName = 'default'

export const ErrorNoFees: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    fees: RD.failure(new Error('no fees'))
  }
  return <Withdraw {...props} />
}
ErrorNoFees.storyName = 'error - no fee'

export const ErrorThorMemo: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    runeBalance: O.some(baseAmount(22))
  }
  return <Withdraw {...props} />
}
ErrorThorMemo.storyName = 'error - thor memo fee'

export const ErrorThorOutFee: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    fees: RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(600000000), assetOut: baseAmount(300) }),
    runeBalance: O.some(baseAmount('100000000000')),
    shares: { rune: baseAmount(100000000), asset: baseAmount('3202499') }
  }
  return <Withdraw {...props} />
}
ErrorThorOutFee.storyName = 'error - thor out fee'

export const ErrorAssetOutFee: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    fees: RD.success({ thorMemo: baseAmount(1000), thorOut: baseAmount(1000), assetOut: baseAmount(600000) }),
    shares: { rune: baseAmount(100000000), asset: baseAmount(200) }
  }
  return <Withdraw {...props} />
}
ErrorAssetOutFee.storyName = 'error - asset out fee'

export const ErrorAllOutFees: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    fees: RD.success({ thorMemo: baseAmount(500000), thorOut: baseAmount(600000), assetOut: baseAmount(700000) }),
    runeBalance: O.some(baseAmount(22)),
    shares: { rune: baseAmount(200), asset: baseAmount(300) }
  }
  return <Withdraw {...props} />
}
ErrorAllOutFees.storyName = 'error - asset out fee'

const meta: Meta = {
  component: Withdraw,
  title: 'Components/Deposit/Withdraw'
}

export default meta
