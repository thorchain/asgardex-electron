import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { FeeRates, Fees, FeeType } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRune67C,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { BNB_TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { RDStatus, getMockRDValueFactory } from '../../../../../shared/mock/rdByStatus'
import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { SendTxParams } from '../../../../services/binance/types'
import { WalletBalances } from '../../../../services/clients'
import { ErrorId, TxHashRD } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../types/wallet'
import { Send } from './Send'
import { SendFormBNB } from './SendFormBNB'
import { SendFormBTC } from './SendFormBTC'
import { SendFormETH } from './SendFormETH'
import { SendFormLTC } from './SendFormLTC'

const defaultProps = {
  txRD: RD.initial,
  inititalActionHandler: () => console.log('initial action'),
  finishActionHandler: () => console.log('finish action'),
  viewTxHandler: (txHash: string) => {
    console.log(`view tx handler: ${txHash}`)
    return Promise.resolve()
  },
  errorActionHandler: () => console.log('error action')
}

const bnbAsset: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(12.3)),
  walletAddress: 'AssetBNB wallet address'
}

const btcBalance: WalletBalance = {
  asset: AssetBTC,
  amount: assetToBase(assetAmount(23.45, BTC_DECIMAL)),
  walletAddress: 'btc wallet address'
}

const runeAsset: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(34.56)),
  walletAddress: 'AssetRune67C wallet address'
}

const ethBalance: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(45.67)),
  walletAddress: 'AssetETH wallet address'
}

const ltcBalance: WalletBalance = {
  asset: AssetLTC,
  amount: assetToBase(assetAmount(56.78)),
  walletAddress: 'AssetLTC wallet address'
}

const SendFormsComponents = {
  SendFormBNB: {
    component: SendFormBNB,
    balance: bnbAsset
  },
  SendFormBTC: {
    component: SendFormBTC,
    balance: btcBalance
  },
  SendFormETH: {
    component: SendFormETH,
    balance: ethBalance
  },
  SendFormLTC: {
    component: SendFormLTC,
    balance: ltcBalance
  }
}

type SendForm = keyof typeof SendFormsComponents

const getSendForm = (component: SendForm) => {
  return SendFormsComponents[component].component
}

const getSendBalance = (component: SendForm) => {
  return SendFormsComponents[component].balance
}

const balances: WalletBalances = [bnbAsset, runeAsset, btcBalance, ethBalance]

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

const defaultComponentProps = {
  balances,
  balance: bnbAsset,
  feesWithRates: RD.success({ fees, rates }),
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) =>
    console.log(
      `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
        asset
      )}, memo: ${memo}`
    ),

  isLoading: false,
  addressValidation: (_: unknown) => true,
  fee: RD.success(assetToBase(BNB_TRANSFER_FEES.single)),
  network: 'testnet' as Network,

  fees: RD.success(fees),
  reloadFeesHandler: () => console.log('reloadFees'),
  validatePassword$: mockValidatePassword$
}

const getTxRdFromStatus = getMockRDValueFactory(
  () => '0xabc123',
  () => ({ errorId: ErrorId.SEND_TX, msg: 'Sending tx failed' })
)

export const Default: Story<{ sendForm: SendForm; txRDStatus: RDStatus; sendTxStatusMsg: string }> = ({
  sendForm,
  txRDStatus,
  sendTxStatusMsg
}) => {
  const Component = useMemo(() => getSendForm(sendForm), [sendForm])
  const balance = useMemo(() => getSendBalance(sendForm), [sendForm])
  const txRD: TxHashRD = useMemo(() => getTxRdFromStatus(txRDStatus), [txRDStatus])
  const isLoading = useMemo(
    () =>
      RD.fold(
        () => false,
        () => true,
        () => false,
        () => false
      )(txRD),
    [txRD]
  )
  return (
    <Send
      {...defaultProps}
      txRD={txRD}
      sendForm={
        <Component
          {...defaultComponentProps}
          sendTxStatusMsg={sendTxStatusMsg}
          balance={balance}
          isLoading={isLoading}
        />
      }
    />
  )
}

const argTypes = {
  sendForm: {
    control: {
      type: 'select',
      options: Object.keys(SendFormsComponents)
    }
  },
  txRDStatus: { control: { type: 'select', options: ['initial', 'pending', 'error', 'success'] } },
  sendTxStatusMsg: {
    control: {}
  }
}

Default.args = { sendForm: 'SendFormBNB', txRDStatus: 'initial', sendTxStatusMsg: '' }

const meta: Meta = {
  component: Send,
  title: 'Wallet/Send',
  argTypes: argTypes
}

export default meta
