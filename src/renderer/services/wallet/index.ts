import { network$ } from '../app/service'
import { createBalancesService } from './balances'
import { setSelectedAsset, selectedAsset$, client$ } from './common'
import { keystoreService, removeKeystore } from './keystore'
import { askLedgerAddressByChain$, getLedgerAddressByChain$, removeLedgerAddressByChain } from './ledger'
import { getTxs$, loadTxs, explorerUrl$, resetTxsPage } from './transaction'

const { reloadBalances, reloadBalancesByChain, balancesState$, chainBalances$ } = createBalancesService({
  keystore$: keystoreService.keystore$,
  network$
})
/**
 * Exports all functions and observables needed at UI level (provided by `WalletContext`)
 */
export {
  client$,
  keystoreService,
  removeKeystore,
  setSelectedAsset,
  selectedAsset$,
  loadTxs,
  resetTxsPage,
  explorerUrl$,
  getTxs$,
  reloadBalances,
  reloadBalancesByChain,
  balancesState$,
  chainBalances$,
  askLedgerAddressByChain$,
  getLedgerAddressByChain$,
  removeLedgerAddressByChain
}
