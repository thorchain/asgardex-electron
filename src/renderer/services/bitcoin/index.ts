import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'

const { pushTx, txRD$, resetTx, sendStakeTx, txs$ } = createTransactionService(client$)
const { fees$, reloadFees, poolFee$, getPoolFeeRate, reloadStakeFee, poolFeeRate$ } = createFeesService(client$)
const { ledgerAddress$, retrieveLedgerAddress, removeLedgerAddress } = createLedgerService()

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
  poolFeeRate$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress
}
