import React from 'react'

import { Story, Meta } from '@storybook/react'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetLUNA } from '@xchainjs/xchain-terra'
import { assetAmount, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { getMockRDValueFactory, RDStatus } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { WalletType } from '../../../../../shared/wallet/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { FeeRD, SendTxStateHandler } from '../../../../services/chain/types'
import { ApiError, ErrorId, WalletBalance } from '../../../../services/wallet/types'
import { SendFormTERRA as Component } from './SendFormTERRA'

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
      () => baseAmount(2000000),
      () => Error('getting fees failed')
    )
  )

  const lunaBalance: WalletBalance = mockWalletBalance({
    asset: AssetLUNA,
    amount: assetToBase(assetAmount(balance))
  })

  const ustBalance: WalletBalance = mockWalletBalance({
    asset: { ...AssetLUNA, symbol: 'UST', ticker: 'UST' },
    amount: assetToBase(assetAmount(12))
  })

  return (
    <Component
      walletType={walletType}
      walletIndex={0}
      walletAddress={'terra-address'}
      transfer$={transfer$}
      balances={[lunaBalance, ustBalance]}
      balance={lunaBalance}
      addressValidation={(_: string) => validAddress}
      fee={feeRD}
      reloadFeesHandler={(params) => console.log('reload fees', params)}
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
  title: 'Wallet/SendFormTERRA',
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
      name: 'LUNA Balance',
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
