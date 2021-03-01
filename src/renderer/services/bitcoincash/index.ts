import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'
// import { createTransactionService } from './transaction'

const { fees$, feesWithRates$, reloadFees } = createFeesService(client$)

export {
  client$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  clientViewState$,
  address$,
  reloadBalances,
  balances$,
  fees$,
  feesWithRates$,
  reloadFees
}
