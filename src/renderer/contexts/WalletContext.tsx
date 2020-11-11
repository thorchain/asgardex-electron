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
  loadAssetTxsHandler$,
  assetTxsByChain$,
  getExplorerTxUrl$,
  assetTxs$,
  setSelectedAsset
} from '../services/wallet/context'

type WalletContextValue = {
  keystoreService: typeof keystoreService
  reloadBalances: typeof reloadBalances
  assetsWBState$: typeof assetsWBState$
  assetsWBChains$: typeof assetsWBChains$
  assetTxsByChain$: typeof assetTxsByChain$
  loadAssetTxsHandler$: typeof loadAssetTxsHandler$
  reloadBalances$: typeof reloadBalances$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  selectedAsset$: typeof selectedAsset$
  assetTxs$: typeof assetTxs$
  setSelectedAsset: typeof setSelectedAsset
}

const initialContext: WalletContextValue = {
  keystoreService,
  reloadBalances,
  reloadBalances$,
  loadAssetTxsHandler$,
  assetsWBState$,
  assetsWBChains$,
  assetTxsByChain$,
  getExplorerTxUrl$,
  selectedAsset$,
  assetTxs$,
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
