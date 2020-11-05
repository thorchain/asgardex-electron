import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { pushTx, txRD$, resetTx, sendStakeTx, loadAssetTxs, assetTxs$ } = createTransactionService(client$)
const { fees$, reloadFees, poolFee$, getPoolFeeRate, reloadStakeFee, poolFeeRate$ } = createFeesService(client$)

/**
 * Exports all functions and observables needed at UI level (provided by `BitcoinContext`)
 */
export {
  client$,
  clientViewState$,
  address$,
  getExplorerTxUrl$,
  reloadBalances,
  balances$,
  fees$,
  poolFee$,
  getPoolFeeRate,
  pushTx,
  sendStakeTx,
  reloadFees,
  txRD$,
  resetTx,
  loadAssetTxs,
  assetTxs$,
  reloadStakeFee,
  poolFeeRate$
}
