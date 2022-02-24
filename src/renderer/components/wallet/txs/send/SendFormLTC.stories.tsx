import { Meta, Story } from '@storybook/react'
import { Fees, FeeRates, FeeType, Address, TxHash, FeesWithRates } from '@xchainjs/xchain-client'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { assetAmount, AssetLTC, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { getMockRDValueFactory, RDStatus } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { WalletType } from '../../../../../shared/wallet/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { SendTxStateHandler } from '../../../../services/chain/types'
import { FeesWithRatesRD } from '../../../../services/litecoin/types'
import { ApiError, ErrorId, WalletBalance } from '../../../../services/wallet/types'
import { SendFormLTC as Component } from './SendFormLTC'

type Args = {
  txRDStatus: RDStatus
  feeRDStatus: RDStatus
  balance: string
  validAddress: boolean
  walletType: WalletType
}

const Template: Story<Args> = ({ txRDStatus, feeRDStatus, balance, validAddress, walletType }) => {
  const transfer$: SendTxStateHandler = (_) =>
    Rx.of({
      steps: { current: txRDStatus === 'initial' ? 0 : 1, total: 1 },
      status: FP.pipe(
        txRDStatus,
        getMockRDValueFactory<ApiError, TxHash>(
          () => 'tx-hash',
          () => ({
            msg: 'error message',
            errorId: ErrorId.SEND_TX
          })
        )
      )
    })

  const ltcBalance: WalletBalance = mockWalletBalance({
    asset: AssetLTC,
    amount: assetToBase(assetAmount(balance, LTC_DECIMAL)),
    walletAddress: 'ltc wallet address'
  })

  const runeBalance: WalletBalance = mockWalletBalance({
    amount: assetToBase(assetAmount(2, LTC_DECIMAL))
  })

  const fees: Fees = {
    type: FeeType.FlatFee,
    fastest: baseAmount(3000),
    fast: baseAmount(2000),
    average: baseAmount(1000)
  }

  const rates: FeeRates = {
    fastest: 5,
    fast: 3,
    average: 2
  }

  const feesWithRates: FeesWithRatesRD = FP.pipe(
    feeRDStatus,
    getMockRDValueFactory<Error, FeesWithRates>(
      () => ({ fees, rates }),
      () => Error('getting fees failed')
    )
  )

  return (
    <Component
      walletType={walletType}
      walletIndex={0}
      walletAddress={'ltc-address'}
      transfer$={transfer$}
      balances={[ltcBalance, runeBalance]}
      balance={ltcBalance}
      addressValidation={(_: Address) => validAddress}
      feesWithRates={feesWithRates}
      reloadFeesHandler={() => console.log('reload fees')}
      validatePassword$={mockValidatePassword$}
      network="testnet"
      openExplorerTxUrl={(txHash: TxHash) => {
        console.log(`Open explorer - tx hash ${txHash}`)
        return Promise.resolve(true)
      }}
      getExplorerTxUrl={(txHash: TxHash) => O.some(`url/asset-${txHash}`)}
    />
  )
}

export const Default = Template.bind({})
const meta: Meta = {
  component: Component,
  title: 'Wallet/SendFormLTC',
  argTypes: {
    txRDStatus: {
      name: 'txRDStatus',
      control: { type: 'select', options: ['pending', 'error', 'success'] },
      defaultValue: 'success'
    },
    feeRDStatus: {
      name: 'feeRD',
      control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] },
      defaultValue: 'success'
    },
    walletType: {
      name: 'wallet type',
      control: { type: 'select', options: ['keystore', 'ledger'] },
      defaultValue: 'keystore'
    },
    balance: {
      name: 'LTC balance',
      control: { type: 'text' },
      defaultValue: '2'
    },
    validAddress: {
      name: 'valid address',
      control: { type: 'boolean' },
      defaultValue: true
    }
  }
}

export default meta
