import { THORChain } from '@xchainjs/xchain-util'

import { network$ } from '../app/service'
import { reloadBalances, balances$, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$, clientUrl$, setClientUrl } from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import {
  getNodeInfos$,
  reloadNodeInfos,
  mimir$,
  reloadMimir,
  getLiquidityProviders,
  reloadLiquidityProviders
} from './thornode'
import { createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$, sendPoolTx$ } = createTransactionService(
  client$,
  network$,
  clientUrl$
)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const interact$ = createInteractService$(sendPoolTx$, txStatus$)

export {
  client$,
  clientState$,
  clientUrl$,
  setClientUrl,
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
  getNodeInfos$,
  reloadNodeInfos,
  mimir$,
  reloadMimir,
  getLiquidityProviders,
  reloadLiquidityProviders
}
