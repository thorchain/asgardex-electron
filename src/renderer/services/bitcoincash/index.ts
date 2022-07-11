import { network$ } from '../app/service'
import { balances$, getBalanceByAddress$, reloadBalances, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { fees$, feesWithRates$, reloadFees, reloadFeesWithRates } = createFeesService(client$)
const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$, network$)

export {
  client$,
  clientState$,
  explorerUrl$,
  address$,
  addressUI$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
  balances$,
  getBalanceByAddress$,
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
