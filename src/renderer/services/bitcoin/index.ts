import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { pushTx, txRD$, resetTx, sendStakeTx, txs$ } = createTransactionService(client$)
const { fees$, reloadFees, poolFee$, getPoolFeeRate, reloadStakeFee, poolFeeRate$ } = createFeesService(client$)

export {
  client$,
  explorerUrl$,
  getExplorerTxUrl$,
  clientViewState$,
  address$,
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
  txs$,
  reloadStakeFee,
  poolFeeRate$
}
