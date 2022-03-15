import { network$ } from '../app/service'
import { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { subscribeTx, txRD$, resetTx, sendTx, txs$, tx$, txStatus$ } = createTransactionService(client$, network$)
const { fees$, reloadFees, feesWithRates$, reloadFeesWithRates } = createFeesService(client$)

export {
  address$,
  addressUI$,
  explorerUrl$,
  client$,
  clientState$,
  balances$,
  reloadBalances,
  getBalanceByAddress$,
  reloadBalances$,
  resetReloadBalances,
  subscribeTx,
  txRD$,
  resetTx,
  sendTx,
  txs$,
  tx$,
  txStatus$,
  fees$,
  reloadFees,
  feesWithRates$,
  reloadFeesWithRates
}
