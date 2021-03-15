import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase, baseAmount, bn, Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { Memo, WithdrawState$ } from '../../../services/chain/types'
import { AsymWithdraw, Props as AsymWitdrawProps } from './AsymWithdraw'

const defaultProps: AsymWitdrawProps = {
  asset: AssetBNB,
  runePrice: bn(1),
  assetPrice: bn(60.972),
  chainAssetBalance: O.some(assetToBase(assetAmount(100))),
  selectedPriceAsset: AssetRuneNative,
  reloadFees: () => console.log('reload fees'),
  share: baseAmount('193011422'),
  disabled: false,
  poolAddresses: O.some({ chain: 'BNB', address: 'vault-address', router: O.some('pool-address') }),
  viewRuneTx: (txHash: string) => console.log('view tx ', txHash),
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  reloadBalances: () => console.log('reload balances'),
  // mock successfull result of withdraw$
  withdraw$: (params) =>
    Rx.of(params).pipe(
      RxOp.tap((params) => console.log('withdraw$ ', params)),
      RxOp.switchMap(
        (_): WithdrawState$ =>
          Rx.of({
            ...INITIAL_WITHDRAW_STATE,
            step: 3,
            withdrawTx: RD.success('rune-tx-hash'),
            withdraw: RD.success(true)
          })
      )
    ),
  fee$: (_chain: Chain, _memo: Memo) => Rx.of(RD.success(baseAmount(1000))),
  network: 'testnet'
}

export const Default: Story = () => <AsymWithdraw {...defaultProps} />
Default.storyName = 'default'

export const ErrorNoFee: Story = () => {
  const props: AsymWitdrawProps = {
    ...defaultProps,
    fee$: (_chain: Chain, _memo: Memo) => Rx.of(RD.failure(Error('no fees')))
  }
  return <AsymWithdraw {...props} />
}
ErrorNoFee.storyName = 'error - no fee'

const meta: Meta = {
  component: AsymWithdraw,
  title: 'Components/Deposit/AsymWithdraw'
}

export default meta
