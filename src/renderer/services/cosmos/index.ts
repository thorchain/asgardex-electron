import { network$ } from '../app/service'
import { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createTransactionService } from './transaction'

const { txs$, tx$ } = createTransactionService(client$, network$)

export {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  balances$,
  reloadBalances,
  getBalanceByAddress$,
  reloadBalances$,
  resetReloadBalances,
  txs$,
  tx$
}
