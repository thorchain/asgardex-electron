import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'
import { subscribeTransfers, miniTickers$ } from './ws'

const { txs$, pushTx, resetTx, txRD$, sendDepositTx } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)

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
  pushTx,
  resetTx,
  sendDepositTx,
  txRD$,
  reloadFees,
  fees$
}
