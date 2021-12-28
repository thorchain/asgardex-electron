import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRune67C, assetToBase, baseAmount, BNBChain } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { BNB_DECIMAL } from '../../../../helpers/assetHelper'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../../../services/chain/const'
import { UpgradeRuneParams, UpgradeRuneTxState, UpgradeRuneTxState$ } from '../../../../services/chain/types'
import { ErrorId, WalletBalances, WalletBalance } from '../../../../services/wallet/types'
import { Upgrade, Props as UpgradeProps } from './Upgrade'

const mockTxState$ = (states: UpgradeRuneTxState[]): UpgradeRuneTxState$ =>
  Rx.interval(1000).pipe(
    // stop interval stream if we don't have state in states anymore
    RxOp.takeWhile((value) => !!states[value]),
    RxOp.map((value) => states[value]),
    RxOp.startWith(INITIAL_UPGRADE_RUNE_STATE)
  )

const bnbBalance: WalletBalance = mockWalletBalance({
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1001)),
  walletAddress: 'BNB address'
})

const runeBnbBalance: WalletBalance = mockWalletBalance({
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2002)),
  walletAddress: 'BNB.Rune address'
})

const runeNativeBalance: WalletBalance = mockWalletBalance({
  amount: assetToBase(assetAmount(0))
})

const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)

// total steps
const total = 3

const defaultProps: UpgradeProps = {
  runeAsset: {
    asset: AssetRune67C,
    decimal: BNB_DECIMAL
  },
  runeNativeAddress: 'rune-native-address',
  walletAddress: 'bnb12312312312123123123123',
  addressValidation: () => true,
  walletType: 'keystore',
  walletIndex: 0,
  reloadOnError: () => {},
  targetPoolAddressRD: RD.success({ chain: BNBChain, address: 'bnb-pool-address', router: O.none, halted: false }),
  validatePassword$: mockValidatePassword$,
  fee: RD.success(baseAmount(37500)),
  upgrade$: (p: UpgradeRuneParams): UpgradeRuneTxState$ => {
    console.log('upgrade$:', p)
    return mockTxState$([
      { steps: { current: 1, total }, status: RD.pending },
      { steps: { current: 2, total }, status: RD.pending },
      { steps: { current: 3, total }, status: RD.pending },
      { steps: { current: 3, total }, status: RD.success('tx-hash') }
    ])
  },
  balances: getBalances([bnbBalance, runeBnbBalance, runeNativeBalance]),
  reloadFeeHandler: () => console.log('reload fee'),
  successActionHandler: (txHash) => {
    console.log('success handler ' + txHash)
    return Promise.resolve(true)
  },
  reloadBalancesHandler: () => console.log('reload balances'),
  network: 'testnet'
}

export const Default: Story = () => <Upgrade {...defaultProps} />
Default.storyName = 'default'

export const HealthCheckFailure: Story = () => {
  const props: UpgradeProps = {
    ...defaultProps,
    upgrade$: (_: UpgradeRuneParams): UpgradeRuneTxState$ =>
      mockTxState$([
        {
          steps: { current: 1, total },
          status: RD.failure({ errorId: ErrorId.VALIDATE_POOL, msg: 'invalid pool address' })
        }
      ])
  }
  return <Upgrade {...props} />
}
HealthCheckFailure.storyName = 'health check failure'

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
