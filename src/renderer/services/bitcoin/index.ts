import { balances$, reloadBalances, getBalanceByAddress$ } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'

const { subscribeTx, txRD$, resetTx, sendTx, txs$ } = createTransactionService(client$)
const { fees$, reloadFees, poolFee$, memoFees$, getPoolFeeRate, reloadDepositFee, poolFeeRate$ } = createFeesService(
  client$
)
const {
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  pushLedgerTx,
  ledgerTxRD$,
  resetLedgerTx
} = createLedgerService()

export {
  client$,
  explorerUrl$,
  getExplorerTxUrl$,
  clientViewState$,
  address$,
  reloadBalances,
  balances$,
  getBalanceByAddress$,
  fees$,
  poolFee$,
  memoFees$,
  getPoolFeeRate,
  subscribeTx,
  sendTx,
  reloadFees,
  txRD$,
  resetTx,
  txs$,
  reloadDepositFee,
  poolFeeRate$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  pushLedgerTx,
  ledgerTxRD$,
  resetLedgerTx
}
