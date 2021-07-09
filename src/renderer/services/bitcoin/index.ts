import { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$ } from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'

const { subscribeTx, txRD$, resetTx, sendTx, txs$, tx$, txStatus$ } = createTransactionService(client$)
const { fees$, reloadFees, feesWithRates$, reloadFeesWithRates } = createFeesService(client$)
const { ledgerAddress$, retrieveLedgerAddress, removeLedgerAddress, pushLedgerTx, ledgerTxRD$, resetLedgerTx } =
  createLedgerService()

export {
  client$,
  clientState$,
  explorerUrl$,
  getExplorerTxUrl$,
  address$,
  addressUI$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
  balances$,
  getBalanceByAddress$,
  reloadFees,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  subscribeTx,
  sendTx,
  txRD$,
  resetTx,
  txs$,
  tx$,
  txStatus$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  pushLedgerTx,
  ledgerTxRD$,
  resetLedgerTx
}
