import { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReloadBalances } from './balances'
import { client$, clientState$, address$, addressUI$, explorerUrl$ } from './common'
import { createFeesService } from './fees'

const { reloadFees, fees$ } = createFeesService(client$)

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
  fees$,
  reloadFees
}
