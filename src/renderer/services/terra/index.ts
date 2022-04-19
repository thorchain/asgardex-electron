import { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, sendPoolTx$, txRD$ } = createTransactionService(client$)

const { reloadFees, fees$, estimatedFees$ } = createFeesService(client$)

export {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  balances$,
  reloadBalances,
  getBalanceByAddress$,
  reloadBalances$,
  resetReloadBalances,
  fees$,
  reloadFees,
  estimatedFees$,
  txs$,
  tx$,
  txStatus$,
  subscribeTx,
  resetTx,
  sendTx,
  sendPoolTx$,
  txRD$
}
