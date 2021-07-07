import { reloadBalances, balances$, reloadBalances$, resetReloadBalances } from './balances'
import {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
} from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$, feesWithRates$, reloadFeesWithRates } = createFeesService(client$)

export {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  balances$,
  reloadBalances$,
  resetReloadBalances,
  txs$,
  tx$,
  txStatus$,
  reloadFees,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
}
