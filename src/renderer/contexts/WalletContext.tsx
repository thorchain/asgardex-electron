import React, { createContext, useContext } from 'react'

import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import {
  reloadBalances,
  assetsWBState$,
  assetsWBChains$,
  reloadBalances$,
  keystoreService,
  selectedAsset$,
  loadTxsHandler$,
  txsByChain$,
  getExplorerTxUrl$,
  txs$,
  setSelectedAsset
} from '../services/wallet/context'

type WalletContextValue = {
  keystoreService: typeof keystoreService
  reloadBalances: typeof reloadBalances
  assetsWBState$: typeof assetsWBState$
  assetsWBChains$: typeof assetsWBChains$
  txsByChain$: typeof txsByChain$
  loadTxsHandler$: typeof loadTxsHandler$
  reloadBalances$: typeof reloadBalances$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  selectedAsset$: typeof selectedAsset$
  txs$: typeof txs$
  setSelectedAsset: typeof setSelectedAsset
}

const initialContext: WalletContextValue = {
  keystoreService,
  reloadBalances,
  reloadBalances$,
  loadTxsHandler$,
  assetsWBState$,
  assetsWBChains$,
  txsByChain$: txsByChain$,
  getExplorerTxUrl$,
  selectedAsset$,
  txs$: txs$,
  setSelectedAsset
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
