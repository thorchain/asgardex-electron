import { THORChain } from '@xchainjs/xchain-util'

import { network$ } from '../app/service'
import { reloadBalances, balances$, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  clientUrl$,
  reloadClientUrl,
  setThornodeRpcUrl,
  setThornodeApiUrl
} from './common'
import { createFeesService } from './fees'
import { createInteractService$ } from './interact'
import { createThornodeService$ } from './thornode'
import { createTransactionService } from './transaction'

const {
  thornodeUrl$,
  reloadThornodeUrl,
  getNodeInfos$,
  reloadNodeInfos,
  inboundAddressesShared$,
  reloadInboundAddresses,
  mimir$,
  reloadMimir,
  getLiquidityProviders,
  reloadLiquidityProviders
} = createThornodeService$(network$, clientUrl$)

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$, sendPoolTx$ } = createTransactionService(
  client$,
  network$,
  clientUrl$
)
const { reloadFees, fees$ } = createFeesService({ client$, chain: THORChain })
const interact$ = createInteractService$(sendPoolTx$, txStatus$)

export {
  thornodeUrl$,
  reloadThornodeUrl,
  inboundAddressesShared$,
  reloadInboundAddresses,
  client$,
  clientState$,
  clientUrl$,
  reloadClientUrl,
  setThornodeRpcUrl,
  setThornodeApiUrl,
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
