import { network$ } from '../app/service'
import { createBalancesService } from './balances'
import { setSelectedAsset, selectedAsset$ } from './common'
import { keystoreService, removeKeystore } from './keystore'
import { getTxs$, loadTxs, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$, resetTxsPage } from './transaction'

const { reloadBalances, reloadBalancesByChain, balancesState$, chainBalances$ } = createBalancesService({
  keystore$: keystoreService.keystore$,
  network$
})
/**
 * Exports all functions and observables needed at UI level (provided by `WalletContext`)
 */
export {
  keystoreService,
  removeKeystore,
  setSelectedAsset,
  selectedAsset$,
  loadTxs,
  resetTxsPage,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  getTxs$,
  reloadBalances,
  reloadBalancesByChain,
  balancesState$,
  chainBalances$
}
