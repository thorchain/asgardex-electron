import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import {
  Asset,
  assetAmount,
  AssetBNB,
  AssetRuneNative,
  assetToBase,
  assetToString,
  baseAmount,
  bn
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { BNB_DECIMAL, THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'
import { INITIAL_WITHDRAW_STATE } from '../../../services/chain/const'
import { WithdrawState$ } from '../../../services/chain/types'
import { Withdraw, Props as WitdrawProps } from './Withdraw'

const defaultProps: WitdrawProps = {
  asset: { asset: AssetBNB, decimal: BNB_DECIMAL },
  runePrice: bn(1),
  assetPrice: bn(60.972),
  runeBalance: O.some(assetToBase(assetAmount(100))),
  selectedPriceAsset: AssetRuneNative,
  reloadFees: () => console.log('reload fees'),
  shares: { rune: assetToBase(assetAmount(10, THORCHAIN_DECIMAL)), asset: assetToBase(assetAmount(30, BNB_DECIMAL)) },
  disabled: false,
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
  fees$: (_: Asset) =>
    Rx.of(
      RD.success({
        rune: {
          inFee: assetToBase(assetAmount(0.3)),
          outFee: assetToBase(assetAmount(0.7))
        },
        asset: {
          asset: AssetBNB,
          amount: assetToBase(assetAmount(0.5))
        }
      })
    ),
  network: 'testnet',
  poolsData: {
    [assetToString(AssetBNB)]: {
      assetBalance: baseAmount(1),
      runeBalance: baseAmount(20)
    }
  }
}

export const Default: Story = () => <Withdraw {...defaultProps} />
Default.storyName = 'default'

export const FeesNotCovered: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    runeBalance: O.some(assetToBase(assetAmount(0.5)))
  }
  return <Withdraw {...props} />
}
FeesNotCovered.storyName = 'error - fees not covered'

export const ErrorNoFee: Story = () => {
  const props: WitdrawProps = {
    ...defaultProps,
    fees$: (_: Asset) => Rx.of(RD.failure(Error('no fees')))
  }
  return <Withdraw {...props} />
}
ErrorNoFee.storyName = 'error - no fee'

const meta: Meta = {
  component: Withdraw,
  title: 'Components/Deposit/Withdraw'
}

export default meta
