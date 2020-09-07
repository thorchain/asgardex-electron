import React, { createContext, useContext } from 'react'

import {
  subscribeTransfers,
  miniTickers$,
  reloadBalances,
  balancesState$,
  client$,
  clientViewState$,
  address$,
  setSelectedAsset,
  txsSelectedAsset$,
  selectedAsset$,
  loadTxsSelectedAsset,
  explorerUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$
} from '../services/binance/service'

export type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  clientViewState$: typeof clientViewState$
  reloadBalances: typeof reloadBalances
  balancesState$: typeof balancesState$
  setSelectedAsset: typeof setSelectedAsset
  txsSelectedAsset$: typeof txsSelectedAsset$
  loadTxsSelectedAsset: typeof loadTxsSelectedAsset
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
  loadTxsSelectedAsset,
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
  return <BinanceContext.Provider value={initialContext}>{children}</BinanceContext.Provider>
}

export const useBinanceContext = () => {
  const context = useContext(BinanceContext)
  if (!context) {
    throw new Error('Context must be used within a BinanceProvider.')
  }
  return context
}
