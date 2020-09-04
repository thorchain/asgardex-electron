import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import {
  subscribeTransfers,
  miniTickers$,
  reloadBalances,
  balancesState$,
  setKeystoreState,
  client$,
  clientViewState$,
  address$,
  setSelectedAsset,
  txsSelectedAsset$,
  selectedAsset$,
  reloadTxssSelectedAsset,
  explorerUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$
} from '../services/binance/service'
import { useWalletContext } from './WalletContext'

export type BinanceContextValue = {
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
  freeze: typeof freeze
  client$: typeof client$
  transferFees$: typeof transferFees$
  freezeFee$: typeof freezeFee$
}

const initialContext: BinanceContextValue = {
  subscribeTransfers,
  miniTickers$,
  client$,
  clientViewState$,
  reloadBalances,
  balancesState$,
  setSelectedAsset,
  txsSelectedAsset$,
  reloadTxssSelectedAsset,
  selectedAsset$,
  address$,
  explorerUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$
}

const BinanceContext = createContext<BinanceContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const BinanceProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const { keystoreService } = useWalletContext()
  // Note: Service does need to subscribe to latest state of keystore and network!
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
