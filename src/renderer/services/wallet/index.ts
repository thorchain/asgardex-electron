import { network$ } from '../app/service'
import { createBalancesService } from './balances'
import { setSelectedAsset, selectedAsset$, client$ } from './common'
import { keystoreService, removeKeystore } from './keystore'
import { createLedgerService } from './ledger'
import { getTxs$, loadTxs, explorerUrl$, resetTxsPage } from './transaction'

const { askLedgerAddress$, getLedgerAddress$, verifyLedgerAddress, removeLedgerAddress } = createLedgerService({
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
  askLedgerAddress$,
  getLedgerAddress$,
  verifyLedgerAddress,
  removeLedgerAddress
}
