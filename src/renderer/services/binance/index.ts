import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'
import { subscribeTransfers, miniTickers$ } from './ws'

const { txs$, subscribeTx, resetTx, txRD$, sendTx } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)
const {
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx
} = createLedgerService()

export {
  client$,
  clientViewState$,
  address$,
  reloadBalances,
  explorerUrl$,
  getExplorerTxUrl$,
  subscribeTransfers,
  miniTickers$,
  balances$,
  txs$,
  sendTx,
  subscribeTx,
  resetTx,
  txRD$,
  reloadFees,
  fees$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx
}
