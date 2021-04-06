import React, { createContext, useContext } from 'react'

import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import {
  reloadBalances,
  balancesState$,
  chainBalances$,
  reloadBalancesByChain,
  keystoreService,
  selectedAsset$,
  loadTxs,
  getExplorerTxUrl$,
  getTxs$,
  setSelectedAsset,
  resetTxsPage,
  clearSavedBalances
} from '../services/wallet'

type WalletContextValue = {
  keystoreService: typeof keystoreService
  reloadBalances: typeof reloadBalances
  balancesState$: typeof balancesState$
  chainBalances$: typeof chainBalances$
  loadTxs: typeof loadTxs
  reloadBalancesByChain: typeof reloadBalancesByChain
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  selectedAsset$: typeof selectedAsset$
  getTxs$: typeof getTxs$
  setSelectedAsset: typeof setSelectedAsset
  resetTxsPage: typeof resetTxsPage
  clearSavedBalances: typeof clearSavedBalances
}

const initialContext: WalletContextValue = {
  keystoreService,
  reloadBalances,
  reloadBalancesByChain,
  loadTxs,
  balancesState$,
  chainBalances$,
  getExplorerTxUrl$,
  selectedAsset$,
  getTxs$,
  setSelectedAsset,
  resetTxsPage,
  clearSavedBalances
}
const WalletContext = createContext<Option<WalletContextValue>>(none)

export const WalletProvider: React.FC = ({ children }): JSX.Element => (
  <WalletContext.Provider value={some(initialContext)}>{children}</WalletContext.Provider>
)

export const useWalletContext = () => {
  const context = O.toNullable(useContext(WalletContext))
  if (!context) {
    throw new Error('Context must be used within a WalletProvider.')
  }
  return context
}
