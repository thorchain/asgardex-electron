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
import { sendTx, txRD$, resetTx } from './transaction'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export {
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
  sendTx,
  txRD$,
  resetTx,
  getExplorerUrlByAsset$
}
