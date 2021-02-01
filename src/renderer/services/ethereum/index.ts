import { ETHChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, tx$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: ETHChain })

export {
  client$,
  clientViewState$,
  address$,
  reloadBalances,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  balances$,
  txs$,
  tx$,
  sendTx,
  subscribeTx,
  resetTx,
  txRD$,
  reloadFees,
  fees$
}
