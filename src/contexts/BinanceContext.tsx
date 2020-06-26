import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import {
  subscribeTransfers,
  miniTickers$,
  reloadBalances,
  balancesState$,
  setKeystoreState,
  clientViewState$
} from '../services/binance/service'
import { useWalletContext } from './WalletContext'

type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  clientViewState$: typeof clientViewState$
  reloadBalances: typeof reloadBalances
  balancesState$: typeof balancesState$
}

const initialContext = {
  subscribeTransfers,
  miniTickers$,
  clientViewState$,
  reloadBalances,
  balancesState$
}

const BinanceContext = createContext<BinanceContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const BinanceProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const { keystoreService } = useWalletContext()
  // Note: Service does need to subscribe to latest state of keystore!
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
