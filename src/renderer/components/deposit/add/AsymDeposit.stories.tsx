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
import { INITIAL_ASYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { AsymDepositState } from '../../../services/chain/types'
import { AsymDeposit, Props as AsymDepositProps } from './AsymDeposit'

const defaultProps: AsymDepositProps = {
  asset: AssetBNB,
  assetPrice: bn(2),
  assetBalance: O.some(assetToBase(assetAmount(200))),
  chainAssetBalance: O.some(assetToBase(assetAmount(55))),
  onChangeAsset: (a: Asset) => console.log('change asset', a),
  reloadFees: () => console.log('reload fees'),
  fees$: () =>
    Rx.of(
      RD.success({
        thor: O.none,
        asset: baseAmount(123)
      })
    ),
  poolData: {
    assetBalance: baseAmount('1000'),
    runeBalance: baseAmount('2000')
  },
  priceAsset: AssetRuneNative,
  assets: [AssetBNB, AssetBTC, ASSETS_MAINNET.TOMO],
  poolAddress: O.none,
  memo: O.some('asym-memo'),
  reloadBalances: () => console.log('reloadBalances'),
  viewAssetTx: (txHash) => {
    console.log(txHash)
  },
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  // mock successfull result of asym. deposit$
  deposit$: (params) =>
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
  network: 'testnet'
}

export const Default: Story = () => <AsymDeposit {...defaultProps} />
Default.storyName = 'default'

export const BalanceError: Story = () => {
  const props: AsymDepositProps = {
    ...defaultProps,
    assetBalance: O.some(ZERO_BASE_AMOUNT)
  }
  return <AsymDeposit {...props} />
}
BalanceError.storyName = 'balance error'

export const FeeError: Story = () => {
  const props: AsymDepositProps = {
    ...defaultProps,
    fees$: () =>
      Rx.of(
        RD.success({
          thor: O.some(baseAmount(2)),
          asset: baseAmount(123)
        })
      ),
    assetBalance: O.some(baseAmount(1)),
    chainAssetBalance: O.some(baseAmount(1))
  }
  return <AsymDeposit {...props} />
}
FeeError.storyName = 'fee error'

const meta: Meta = {
  component: AsymDeposit,
  title: 'Components/Deposit/AsymDeposit'
}

export default meta
