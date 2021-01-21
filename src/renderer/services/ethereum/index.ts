import { reloadBalances, balances$ } from './balances'
import { client$, address$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, tx$: loadTx$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)

export {
  address$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  loadTx$,
  reloadFees,
  fees$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$
}
