import { balances$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ } from './common'
import { createFeesService } from './fees'

const { fees$, feesWithRates$, reloadFees, reloadFeesWithRates } = createFeesService(client$)

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
  reloadFeesWithRates,
  feesWithRates$,
  reloadFees
}
