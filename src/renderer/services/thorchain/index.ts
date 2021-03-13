import { THORChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import { client$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { getNodeInfo$, reloadNodesInfo } from './thorNode'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$, sendDepositTx } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const interact$ = createInteractService$(sendDepositTx, txStatus$)

export {
  address$,
  addressUI$,
  explorerUrl$,
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
  interact$,
  getNodeInfo$,
  reloadNodesInfo
}
