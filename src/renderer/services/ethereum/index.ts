import { reloadBalances, balances$ } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)

export {
  client$,
  clientViewState$,
  address$,
  reloadBalances,
  explorerUrl$,
  getExplorerTxUrl$,
  balances$,
  txs$,
  sendTx,
  subscribeTx,
  resetTx,
  txRD$,
  reloadFees,
  fees$
}
