import { network$ } from '../app/service'
import { createBalancesService } from './balances'
import { setSelectedAsset, selectedAsset$, client$ } from './common'
import { keystoreService, removeKeystoreWallet } from './keystore'
import { createLedgerService } from './ledger'
import { getTxs$, loadTxs, explorerUrl$, resetTxsPage } from './transaction'

const {
  addLedgerAddress$,
  getLedgerAddress$,
  verifyLedgerAddress$,
  removeLedgerAddress,
  ledgerAddresses$,
  reloadPersistentLedgerAddresses,
  persistentLedgerAddresses$
} = createLedgerService({
  keystore$: keystoreService.keystoreState$,
  wallets$: keystoreService.keystoreWalletsUI$,
  network$
})

const { reloadBalances, reloadBalancesByChain, balancesState$, chainBalances$ } = createBalancesService({
  keystore$: keystoreService.keystoreState$,
  network$,
  getLedgerAddress$
})

/**
 * Exports all functions and observables needed at UI level (provided by `WalletContext`)
 */
export {
  client$,
  keystoreService,
  removeKeystoreWallet,
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
  ledgerAddresses$,
  addLedgerAddress$,
  getLedgerAddress$,
  verifyLedgerAddress$,
  removeLedgerAddress,
  reloadPersistentLedgerAddresses,
  persistentLedgerAddresses$
}
