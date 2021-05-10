import { BNBChain } from '@xchainjs/xchain-util'

import { balances$, reloadBalances, reloadBalances$, resetReloadBalances } from './balances'
import {
  client$,
  clientViewState$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  addressUI$
} from './common'
import { createFeesService } from './fees'
import { createLedgerService } from './ledger'
import { createTransactionService } from './transaction'
import { subscribeTransfers, miniTickers$ } from './ws'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, txRD$, sendTx } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: BNBChain })
const { ledgerAddress$, retrieveLedgerAddress, removeLedgerAddress, ledgerTxRD$, pushLedgerTx, resetLedgerTx } =
  createLedgerService()

export {
  client$,
  clientViewState$,
  address$,
  addressUI$,
  reloadBalances,
  reloadBalances$,
  resetReloadBalances,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  subscribeTransfers,
  miniTickers$,
  balances$,
  txs$,
  tx$,
  txStatus$,
  sendTx,
  subscribeTx,
  resetTx,
  txRD$,
  reloadFees,
  fees$,
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx
}
