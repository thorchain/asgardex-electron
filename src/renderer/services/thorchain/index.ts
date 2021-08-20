import { THORChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import {
  getNodeInfo$,
  reloadNodesInfo,
  mimir$,
  reloadMimir,
  getLiquidityProvider,
  reloadLiquidityProviders
} from './thorNode'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$, sendPoolTx$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const interact$ = createInteractService$(sendPoolTx$, txStatus$)

export {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
  balances$,
  getBalanceByAddress$,
  txs$,
  tx$,
  txStatus$,
  reloadFees,
  fees$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  sendPoolTx$,
  interact$,
  getNodeInfo$,
  reloadNodesInfo,
  mimir$,
  reloadMimir,
  getLiquidityProvider,
  reloadLiquidityProviders
}
