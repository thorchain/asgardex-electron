import React, { createContext, useContext } from 'react'

import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import {
  reloadBalances,
  balancesState$,
  assetsWBChains$,
  reloadBalances$,
  keystoreService,
  selectedAsset$,
  loadTxs,
  getExplorerTxUrl$,
  txs$,
  setSelectedAsset,
  resetTxsPage
} from '../services/wallet'

type WalletContextValue = {
  keystoreService: typeof keystoreService
  reloadBalances: typeof reloadBalances
  balancesState$: typeof balancesState$
  assetsWBChains$: typeof assetsWBChains$
  loadTxs: typeof loadTxs
  reloadBalances$: typeof reloadBalances$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  selectedAsset$: typeof selectedAsset$
  txs$: typeof txs$
  setSelectedAsset: typeof setSelectedAsset
  resetTxsPage: typeof resetTxsPage
}

const initialContext: WalletContextValue = {
  keystoreService,
  reloadBalances,
  reloadBalances$,
  loadTxs,
  balancesState$,
  assetsWBChains$,
  getExplorerTxUrl$,
  selectedAsset$,
  txs$,
  setSelectedAsset,
  resetTxsPage
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
