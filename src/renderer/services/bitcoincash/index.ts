import { balances$, reloadBalances, reloadBalances$, resetReloadBalances } from './balances'
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

const { fees$, feesWithRates$, reloadFees, reloadFeesWithRates } = createFeesService(client$)
const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)

export {
  client$,
  clientState$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  address$,
  addressUI$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
  balances$,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  reloadFees,
  txs$,
  tx$,
  txStatus$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$
}
