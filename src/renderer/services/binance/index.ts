import { balances$ } from './balances'
import { client$, clientViewState$, address$, reloadBalances, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'
import { subscribeTransfers, miniTickers$, wsTransfer$ } from './ws'

const { txs$, pushTx, resetTx, txRD$, sendStakeTx, txWithState$ } = createTransactionService(client$, wsTransfer$)
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
  wsTransfer$,
  balances$,
  txs$,
  pushTx,
  resetTx,
  sendStakeTx,
  txWithState$,
  txRD$,
  reloadFees,
  fees$
}
