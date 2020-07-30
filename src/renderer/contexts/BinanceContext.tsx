import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import {
  subscribeTransfers,
  miniTickers$,
  reloadBalances,
  balancesState$,
  setKeystoreState,
  clientViewState$,
  setNetworkState,
  address$,
  setSelectedAsset,
  txsSelectedAsset$,
  selectedAsset$,
  reloadTxssSelectedAsset,
  explorerUrl$,
  transaction
} from '../services/binance/service'
import { useAppContext } from './AppContext'
import { useWalletContext } from './WalletContext'

type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  clientViewState$: typeof clientViewState$
  reloadBalances: typeof reloadBalances
  balancesState$: typeof balancesState$
  setSelectedAsset: typeof setSelectedAsset
  txsSelectedAsset$: typeof txsSelectedAsset$
  reloadTxssSelectedAsset: typeof reloadTxssSelectedAsset
  selectedAsset$: typeof selectedAsset$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  transaction: typeof transaction
}

const initialContext: BinanceContextValue = {
  subscribeTransfers,
  miniTickers$,
  clientViewState$,
  reloadBalances,
  balancesState$,
  setSelectedAsset,
  txsSelectedAsset$,
  reloadTxssSelectedAsset,
  selectedAsset$,
  address$,
  explorerUrl$,
  transaction
}

const BinanceContext = createContext<BinanceContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const BinanceProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { network$ } = useAppContext()
  // Note: Service does need to subscribe to latest state of keystore and network!
  useSubscription(network$, (network) => setNetworkState(network))
  useSubscription(keystoreService.keystore$, (keystore) => setKeystoreState(keystore))

  return <BinanceContext.Provider value={initialContext}>{children}</BinanceContext.Provider>
}

export const useBinanceContext = () => {
  const context = useContext(BinanceContext)
  if (!context) {
    throw new Error('Context must be used within a BinanceProvider.')
  }
  return context
}
