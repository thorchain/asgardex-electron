import { network$ } from '../app/service'
import { createBalancesService } from './balances'
import { setSelectedAsset, selectedAsset$, client$ } from './common'
import { keystoreService, removeKeystoreWallet } from './keystore'
import { createLedgerService } from './ledger'
import { getTxs$, loadTxs, explorerUrl$, resetTxsPage } from './transaction'

const { askLedgerAddress$, getLedgerAddress$, verifyLedgerAddress, removeLedgerAddress, ledgerAddresses$ } =
  createLedgerService({
    keystore$: keystoreService.keystore$
  })

const { reloadBalances, reloadBalancesByChain, balancesState$, chainBalances$ } = createBalancesService({
  keystore$: keystoreService.keystore$,
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
  askLedgerAddress$,
  getLedgerAddress$,
  verifyLedgerAddress,
  removeLedgerAddress
}
