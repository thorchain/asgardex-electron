import { assetWB$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$ } from './common'
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
  explorerUrl$,
  reloadBalances,
  assetWB$,
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
