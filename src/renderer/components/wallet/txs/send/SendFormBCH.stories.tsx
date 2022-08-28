import { ComponentMeta } from '@storybook/react'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { Address, FeeRates, Fees, FeesWithRates, FeeType, TxHash } from '@xchainjs/xchain-client'
import { assetAmount, AssetBCH, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { getMockRDValueFactory, RDStatus } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { WalletType } from '../../../../../shared/wallet/types'
import { THORCHAIN_DECIMAL } from '../../../../helpers/assetHelper'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { FeesWithRatesRD } from '../../../../services/bitcoin/types'
import { SendTxStateHandler } from '../../../../services/chain/types'
import { ApiError, ErrorId, WalletBalance } from '../../../../services/wallet/types'
import { SendFormBCH as Component } from './SendFormBCH'

type Args = {
  txRDStatus: RDStatus
  feeRDStatus: RDStatus
  balance: string
  validAddress: boolean
  walletType: WalletType
}

const Template = ({ txRDStatus, feeRDStatus, balance, validAddress, walletType }: Args) => {
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

  const bchBalance: WalletBalance = mockWalletBalance({
    asset: AssetBCH,
    amount: assetToBase(assetAmount(balance, BCH_DECIMAL)),
    walletAddress: 'bch wallet address'
  })

  const runeBalance: WalletBalance = mockWalletBalance({
    amount: assetToBase(assetAmount(2, THORCHAIN_DECIMAL))
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
      asset={{ asset: AssetBCH, walletAddress: 'bch-address', walletType, walletIndex: 0, hdMode: 'default' }}
      transfer$={transfer$}
      balances={[bchBalance, runeBalance]}
      balance={bchBalance}
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

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Wallet/SendFormBCH',
  argTypes: {
    txRDStatus: {
      control: { type: 'select', options: ['pending', 'error', 'success'] }
    },
    feeRDStatus: {
      control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] }
    },
    walletType: {
      control: { type: 'select', options: ['keystore', 'ledger'] }
    },
    balance: {
      control: { type: 'text' }
    }
  },
  args: {
    txRDStatus: 'success',
    feeRDStatus: 'success',
    walletType: 'keystore',
    balance: '2',
    validAddress: true
  }
}

export default meta
