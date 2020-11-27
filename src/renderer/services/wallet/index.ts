import { address$ } from './address'
import { reloadBalances, reloadBalances$, balancesState$, chainBalances$ } from './balances'
import { setSelectedAsset, selectedAsset$ } from './common'
import { keystoreService, removeKeystore } from './keystore'
import { txs$, loadTxs, explorerUrl$, getExplorerTxUrl$, resetTxsPage } from './transaction'

/**
 * Exports all functions and observables needed at UI level (provided by `WalletContext`)
 */
export {
  address$,
  keystoreService,
  removeKeystore,
  setSelectedAsset,
  selectedAsset$,
  loadTxs,
  resetTxsPage,
  explorerUrl$,
  getExplorerTxUrl$,
  txs$,
  reloadBalances,
  reloadBalances$,
  balancesState$,
  chainBalances$
}
