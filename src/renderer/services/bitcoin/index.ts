import { balances$, reloadBalances, getBalanceByAddress$ } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'

const { subscribeTx, txRD$, resetTx, sendTx, txs$, tx$, txStatus$ } = createTransactionService(client$)
const { fees$, reloadFees, memoFees$ } = createFeesService(client$)
const {
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  pushLedgerTx,
  ledgerTxRD$,
  resetLedgerTx
} = createLedgerService()

export {
  client$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  clientViewState$,
  address$,
  reloadBalances,
  balances$,
  getBalanceByAddress$,
  fees$,
  memoFees$,
  subscribeTx,
  sendTx,
  reloadFees,
  txRD$,
  resetTx,
  txs$,
  tx$,
  txStatus$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  pushLedgerTx,
  ledgerTxRD$,
  resetLedgerTx
}
