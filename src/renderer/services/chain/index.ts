import { addressByChain$, assetAddress$ } from './address'
import { clientByChain$ } from './client'
import { isCrossChainDeposit$ } from './common'
import { getExplorerUrlByAsset$ } from './explorerUrl'
import {
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  reloadSwapFees,
  swapFees$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } from './ledger'
import { asymDepositTxMemo$, symDepositTxMemo$ } from './memo'
import { subscribeTx, txRD$, resetTx, swap$ } from './transaction'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export {
  addressByChain$,
  clientByChain$,
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees,
  swapFees$,
  subscribeTx,
  txRD$,
  resetTx,
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$
}
