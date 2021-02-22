import { LTCChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import { client$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$, feesWithRates$ } = createFeesService({ client$, chain: LTCChain })

export {
  address$,
  explorerUrl$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  tx$,
  txStatus$,
  reloadFees,
  fees$,
  feesWithRates$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
}
