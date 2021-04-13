import { THORChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { getNodeInfo$, reloadNodesInfo, mimir$, reloadMimir } from './thorNode'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$, sendPoolTx$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const interact$ = createInteractService$(sendPoolTx$, txStatus$)

export {
  address$,
  addressUI$,
  explorerUrl$,
  client$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
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
  sendPoolTx$,
  interact$,
  getNodeInfo$,
  reloadNodesInfo,
  mimir$,
  reloadMimir
}
