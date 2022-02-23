import React from 'react'

import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { assetAmount, AssetBNB, AssetRune67C, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { getMockRDValueFactory, RDStatus } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { WalletType } from '../../../../../shared/wallet/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { FeeRD, SendTxStateHandler } from '../../../../services/chain/types'
import { ApiError, ErrorId, WalletBalance } from '../../../../services/wallet/types'
import { SendFormBNB as Component } from './SendFormBNB'

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
  const feeRD: FeeRD = FP.pipe(
    feeRDStatus,
    getMockRDValueFactory<Error, BaseAmount>(
      () => baseAmount(375000),
      () => Error('getting fees failed')
    )
  )

  const bnbBalance: WalletBalance = mockWalletBalance({
    asset: AssetBNB,
    amount: assetToBase(assetAmount(balance)),
    walletAddress: 'AssetBNB wallet address'
  })

  const runeBalance: WalletBalance = mockWalletBalance({
    asset: AssetRune67C,
    amount: assetToBase(assetAmount(234)),
    walletAddress: 'AssetRune67C wallet address'
  })
  return (
    <Component
      walletType={walletType}
      walletIndex={0}
      walletAddress={'bnb-address'}
      transfer$={transfer$}
      balances={[bnbBalance, runeBalance]}
      balance={bnbBalance}
      addressValidation={(_: string) => validAddress}
      fee={feeRD}
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

const meta: Meta<Args> = {
  component: Component,
  title: 'Wallet/SendFormBNB',
  argTypes: {
    txRDStatus: {
      name: 'txRDStatus',
      control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] },
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
      name: 'BNB Balance',
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
