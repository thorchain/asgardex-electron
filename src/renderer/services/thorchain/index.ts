import { reloadBalances, balances$ } from './balances'
import { client$, address$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { createDepositService, createTransactionService } from './transaction'

const { txs$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)
const { sendTx: sendDepositTx } = createDepositService(client$)
const interact$ = createInteractService$(sendDepositTx)

export {
  address$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  reloadFees,
  fees$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  sendDepositTx,
  interact$
}
