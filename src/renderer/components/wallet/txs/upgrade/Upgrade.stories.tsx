import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRune67C, AssetRuneNative, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { TxHashLD, TxHashRD } from '../../../../services/wallet/types'
import { WalletBalance, WalletBalances } from '../../../../types/wallet'
import { Upgrade, Props as UpgradeProps } from './Upgrade'

const _mockTxLD = (states: TxHashRD[]): TxHashLD =>
  Rx.interval(1000).pipe(
    RxOp.map((value) => states[value]),
    RxOp.takeUntil(Rx.timer(3000)),
    RxOp.startWith(RD.pending)
  )

const bnbBalance: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1001)),
  walletAddress: 'BNB address'
}

const runeBnbBalance: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2002)),
  walletAddress: 'BNB.Rune address'
}

const runeNativeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(0)),
  walletAddress: 'Rune native address'
}

const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)

const defaultProps: UpgradeProps = {
  runeAsset: AssetRune67C,
  runeNativeAddress: 'rune-native-address',
  bnbPoolAddressRD: RD.success('bnb-pool-address'),
  validatePassword$: mockValidatePassword$,
  fee: RD.success(baseAmount(37500)),
  // sendUpgradeTx: (p: SendTxParams): TxHashLD => {
  //   console.log('SendTxParams:', p)
  //   return mockTxLD([
  //     RD.pending,
  //     RD.failure({
  //       errorId: ErrorId.SEND_TX,
  //       msg: 'error-msg'
  //     })
  //   ])
  // },
  sendUpgradeTx: (_) => Rx.of(RD.initial),
  balances: getBalances([bnbBalance, runeBnbBalance, runeNativeBalance]),
  reloadFeeHandler: () => console.log('reload fee'),
  successActionHandler: (txHash) => {
    console.log('success handler ' + txHash)
    return Promise.resolve(undefined)
  },
  errorActionHandler: () => console.log('error handler fee')
}

export const Default: Story = () => <Upgrade {...defaultProps} />
Default.storyName = 'default'

export const NoFees: Story = () => {
  const props: UpgradeProps = { ...defaultProps, fee: RD.failure(Error('no fees')) }
  return <Upgrade {...props} />
}
NoFees.storyName = 'no fees'

export const FeesNotCovered: Story = () => {
  const props: UpgradeProps = {
    ...defaultProps,
    balances: getBalances([{ ...bnbBalance, amount: baseAmount(30) }, runeBnbBalance, runeNativeBalance])
  }
  return <Upgrade {...props} />
}
FeesNotCovered.storyName = 'fees not covered'

const meta: Meta = {
  component: Upgrade,
  title: 'Wallet/Upgrade'
}

export default meta
