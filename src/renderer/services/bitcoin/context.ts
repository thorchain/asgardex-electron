import { assetWB$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { pushTx, txRD$, resetTx, loadAssetTxs, assetTxs$ } = createTransactionService(client$)
const { fees$, reloadFees, stakeFee$, reloadStakeFee } = createFeesService(client$)

/**
 * Exports all functions and observables needed at UI level (provided by `BitcoinContext`)
 */
export {
  client$,
  clientViewState$,
  address$,
  getExplorerTxUrl$,
  reloadBalances,
  assetWB$,
  fees$,
  stakeFee$,
  pushTx,
  reloadFees,
  txRD$,
  resetTx,
  loadAssetTxs,
  assetTxs$,
  reloadStakeFee
}
