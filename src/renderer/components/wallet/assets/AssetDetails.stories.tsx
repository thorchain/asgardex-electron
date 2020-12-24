import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { BaseStory } from '@storybook/addons'
import { assetAmount, AssetBNB, AssetRune67C, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { SendTxParams } from '../../../services/binance/types'
import { ErrorId, TxLD, TxRD } from '../../../services/wallet/types'
import { WalletBalance, WalletBalances } from '../../../types/wallet'
import { PrivateModal } from '../../modal/private'
import { AssetDetails } from './index'

const bnbBalance: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.1)),
  walletAddress: 'BNB address'
}

const runeBnbBalance: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2.2)),
  walletAddress: 'BNB.Rune address'
}

const runeNativeBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(0)),
  walletAddress: 'Rune native address'
}

const runeBalanceEmpty: WalletBalance = { ...runeBnbBalance, amount: ZERO_BASE_AMOUNT }
const getBalances = (balances: WalletBalances) => NEA.fromArray<WalletBalance>(balances)
const balances = getBalances([bnbBalance, runeBnbBalance, runeNativeBalance])

const mockTxLD = (states: TxRD[]): TxLD =>
  Rx.interval(1000).pipe(
    RxOp.map((value) => states[value]),
    RxOp.takeUntil(Rx.timer(3000)),
    RxOp.startWith(RD.pending)
  )

const sendUpgradeRuneTx = (p: SendTxParams): TxLD => {
  console.log('SendTxParams:', p)
  return mockTxLD([RD.pending, RD.success('tx-hash')])
}

const sendUpgradeRuneTxError = (p: SendTxParams): TxLD => {
  console.log('SendTxParams:', p)
  return mockTxLD([
    RD.pending,
    RD.failure({
      errorId: ErrorId.SEND_TX,
      msg: 'error-msg'
    })
  ])
}

const poolAddress = O.some('pool address')

const thorAddress = O.some('thor address')

const UpgradeConfirmationModal: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => (
  <PrivateModal visible onOk={onClose} onCancel={onClose} onConfirm={onSuccess} />
)

export const StoryBNB: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={balances}
    asset={O.some(AssetBNB)}
    sendTx={sendUpgradeRuneTx}
    poolAddress={poolAddress}
    UpgradeConfirmationModal={UpgradeConfirmationModal}
  />
)
StoryBNB.storyName = 'BNB'

export const StoryRuneTxSuccess: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={balances}
    asset={O.some(AssetRune67C)}
    sendTx={sendUpgradeRuneTx}
    runeNativeAddress={thorAddress}
    poolAddress={poolAddress}
    UpgradeConfirmationModal={UpgradeConfirmationModal}
  />
)
StoryRuneTxSuccess.storyName = 'RUNE - tx success'

export const StoryRuneTxError: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={balances}
    asset={O.some(AssetRune67C)}
    sendTx={sendUpgradeRuneTxError}
    runeNativeAddress={thorAddress}
    poolAddress={poolAddress}
    UpgradeConfirmationModal={UpgradeConfirmationModal}
  />
)
StoryRuneTxError.storyName = 'RUNE - tx error'

export const StoryRuneNoBalances: BaseStory<never, JSX.Element> = () => (
  <AssetDetails
    txsPageRD={RD.initial}
    balances={getBalances([runeBalanceEmpty])}
    asset={O.some(AssetRune67C)}
    sendTx={sendUpgradeRuneTx}
    poolAddress={poolAddress}
    UpgradeConfirmationModal={UpgradeConfirmationModal}
  />
)
StoryRuneNoBalances.storyName = 'RUNE - disabled - no balance'

export default {
  title: 'Wallet/AssetsDetails'
}
