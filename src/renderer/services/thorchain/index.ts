import { THORChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import { client$, address$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { createDepositService, createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const { sendTx: sendDepositTx } = createDepositService(client$)
const interact$ = createInteractService$(sendDepositTx, txStatus$)

export {
  address$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  tx$,
  txStatus$,
  reloadFees,
  fees$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  sendDepositTx,
  interact$
}
