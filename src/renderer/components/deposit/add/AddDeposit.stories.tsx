import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import {
  bn,
  assetAmount,
  assetToBase,
  AssetBNB,
  baseAmount,
  AssetBTC,
  AssetRuneNative,
  Asset
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { INITIAL_ASYM_DEPOSIT_STATE, INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { AsymDepositState, SendDepositTxParams, SymDepositState } from '../../../services/chain/types'
import { AddDeposit, Props as AddDepositProps } from './AddDeposit'

const defaultProps: AddDepositProps = {
  type: 'asym',
  asset: AssetBNB,
  assetPrice: bn(2),
  runePrice: bn(1),
  assetBalance: O.some(assetToBase(assetAmount(200))),
  runeBalance: O.some(assetToBase(assetAmount(100))),
  chainAssetBalance: O.some(assetToBase(assetAmount(55))),
  onDeposit: (p: SendDepositTxParams) => console.log('on Deposit fees', p),
  onChangeAsset: (a: Asset) => console.log('change asset', a),
  reloadFees: () => console.log('reload fees'),
  fees: RD.success({
    thor: O.none,
    asset: baseAmount(123)
  }),
  poolData: {
    assetBalance: baseAmount('1000'),
    runeBalance: baseAmount('2000')
  },
  priceAsset: AssetRuneNative,
  assets: [AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO],
  poolAddress: O.none,
  symDepositMemo: O.some({ rune: 'rune-memo', asset: 'asset-memo' }),
  asymDepositMemo: O.some('asym-memo'),
  reloadBalances: () => console.log('reloadBalances'),
  viewAssetTx: (txHash) => {
    console.log(txHash)
  },
  viewRuneTx: (txHash) => {
    console.log(txHash)
  },
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  // mock successfull result of asym. deposit$
  asymDeposit$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('asymDeposit$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<AsymDepositState>({
          ...INITIAL_ASYM_DEPOSIT_STATE,
          step: 3,
          depositTx: RD.success('tx-hash'),
          deposit: RD.success(true)
        })
      )
    ),
  // mock successfull result of sym. deposit$
  symDeposit$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('deposit$ ', params)),
      RxOp.switchMap((_) =>
        Rx.of<SymDepositState>({
          ...INITIAL_SYM_DEPOSIT_STATE,
          step: 4,
          depositTxs: { rune: RD.success('rune-tx-hash'), asset: RD.success('asset-tx-hash') },
          deposit: RD.success(true)
        })
      )
    )
}

export const SymDeposit: Story = () => {
  const props: AddDepositProps = { ...defaultProps, type: 'sym' }
  return <AddDeposit {...props} />
}
SymDeposit.storyName = 'sym'

export const SymDepositBalanceError: Story = () => {
  const props: AddDepositProps = {
    ...defaultProps,
    type: 'sym',
    assetBalance: O.some(ZERO_BASE_AMOUNT),
    runeBalance: O.some(ZERO_BASE_AMOUNT),
    chainAssetBalance: O.none
  }
  return <AddDeposit {...props} />
}
SymDepositBalanceError.storyName = 'sym - balance error'

export const SymDepositFeeError: Story = () => {
  const props: AddDepositProps = {
    ...defaultProps,
    type: 'sym',
    assetBalance: O.some(baseAmount(1)),
    runeBalance: O.some(baseAmount(1)),
    chainAssetBalance: O.some(baseAmount(1))
  }
  return <AddDeposit {...props} />
}
SymDepositFeeError.storyName = 'sym - fee error'

export const AsymDeposit: Story = () => <AddDeposit {...defaultProps} />
AsymDeposit.storyName = 'asym'

export const ASymDepositBalanceError: Story = () => {
  const props: AddDepositProps = {
    ...defaultProps,
    type: 'asym',
    assetBalance: O.some(ZERO_BASE_AMOUNT),
    runeBalance: O.some(ZERO_BASE_AMOUNT)
  }
  return <AddDeposit {...props} />
}
ASymDepositBalanceError.storyName = 'asym - balance error'

export const AsymDepositFeeError: Story = () => {
  const props: AddDepositProps = {
    ...defaultProps,
    type: 'asym',
    fees: RD.success({
      thor: O.some(baseAmount(2)),
      asset: baseAmount(123)
    }),
    assetBalance: O.some(baseAmount(1)),
    runeBalance: O.some(baseAmount(1)),
    chainAssetBalance: O.some(baseAmount(1))
  }
  return <AddDeposit {...props} />
}
AsymDepositFeeError.storyName = 'asym - fee error'

const meta: Meta = {
  component: AddDeposit,
  title: 'Components/Deposit/AddDeposit'
}

export default meta
