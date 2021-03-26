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
import { BNB_DECIMAL } from '../../../helpers/assetHelper'
import { INITIAL_SYM_DEPOSIT_STATE } from '../../../services/chain/const'
import { SymDepositState } from '../../../services/chain/types'
import { WalletBalance } from '../../../types/wallet'
import { SymDeposit, Props as SymDepositProps } from './SymDeposit'

const balanceBNB: WalletBalance = {
  amount: baseAmount('1'),
  asset: AssetBNB,
  walletAddress: ''
}

const balanceBTC: WalletBalance = {
  ...balanceBNB,
  asset: AssetBTC
}

const balanceTOMO: WalletBalance = {
  ...balanceBNB,
  asset: ASSETS_MAINNET.TOMO
}

const defaultProps: SymDepositProps = {
  asset: { asset: AssetBNB, decimal: BNB_DECIMAL },
  assetPrice: bn(2),
  runePrice: bn(1),
  assetBalance: O.some(assetToBase(assetAmount(200))),
  runeBalance: O.some(assetToBase(assetAmount(100))),
  chainAssetBalance: O.some(assetToBase(assetAmount(55))),
  onChangeAsset: (a: Asset) => console.log('change asset', a),
  reloadFees: () => console.log('reload fees'),
  fees$: () =>
    Rx.of(
      RD.success({
        thor: O.some(baseAmount(100)),
        asset: baseAmount(12300)
      })
    ),
  poolData: {
    assetBalance: baseAmount('1000'),
    runeBalance: baseAmount('2000')
  },
  priceAsset: AssetRuneNative,
  balances: [balanceBNB, balanceBTC, balanceTOMO],
  poolAddress: O.none,
  memos: O.some({ rune: 'rune-memo', asset: 'asset-memo' }),
  reloadBalances: () => console.log('reloadBalances'),
  reloadShares: (delay = 0) => console.log('reloadShares ', delay),
  reloadSelectedPoolDetail: (delay = 0) => console.log('reloadSelectedPoolDetail ', delay),
  viewAssetTx: (txHash) => {
    console.log(txHash)
  },
  viewRuneTx: (txHash) => {
    console.log(txHash)
  },
  // mock password validation
  // Password: "123"
  validatePassword$: mockValidatePassword$,
  // mock successfull result of sym. deposit$
  deposit$: (params) =>
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
    ),
  network: 'testnet',
  approveERC20Token$: () => Rx.of(RD.success('txHash')),
  isApprovedERC20Token$: () => Rx.of(RD.success(true))
}

export const Default: Story = () => <SymDeposit {...defaultProps} />

Default.storyName = 'default'

export const BalanceError: Story = () => {
  const props: SymDepositProps = {
    ...defaultProps,
    assetBalance: O.some(ZERO_BASE_AMOUNT),
    runeBalance: O.some(ZERO_BASE_AMOUNT),
    chainAssetBalance: O.none
  }
  return <SymDeposit {...props} />
}
BalanceError.storyName = 'balance error'

export const FeeError: Story = () => {
  const props: SymDepositProps = {
    ...defaultProps,
    assetBalance: O.some(baseAmount(1)),
    runeBalance: O.some(baseAmount(1)),
    chainAssetBalance: O.some(baseAmount(1))
  }
  return <SymDeposit {...props} />
}
FeeError.storyName = 'fee error'

const meta: Meta = {
  component: SymDeposit,
  title: 'Components/Deposit/SymDeposit'
}

export default meta
