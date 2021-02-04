import { THORChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import { client$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { getNodeInfo$ } from './thorNode'
import { createDepositService, createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const { sendTx: sendDepositTx } = createDepositService(client$)
const interact$ = createInteractService$(sendDepositTx, txStatus$)

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
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  sendDepositTx,
  interact$,
  getNodeInfo$
}
