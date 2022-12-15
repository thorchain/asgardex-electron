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
  reloadThorchainConstants,
  thorchainConstantsState$,
  thorchainLastblockState$,
  reloadThorchainLastblock,
  inboundAddressesShared$,
  loadInboundAddresses$,
  reloadInboundAddresses,
  mimir$,
  reloadMimir,
  getLiquidityProviders,
  reloadLiquidityProviders,
  getSaverProvider$,
  reloadSaverProvider
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
  loadInboundAddresses$,
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
  reloadThorchainConstants,
  thorchainConstantsState$,
  thorchainLastblockState$,
  reloadThorchainLastblock,
  mimir$,
  reloadMimir,
  getLiquidityProviders,
  reloadLiquidityProviders,
  getSaverProvider$,
  reloadSaverProvider
}
