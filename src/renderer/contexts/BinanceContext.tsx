import React, { createContext, useContext } from 'react'

import {
  subscribeTransfers,
  miniTickers$,
  client$,
  clientViewState$,
  address$,
  assetTxs$,
  getExplorerTxUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$,
  explorerUrl$
} from '../services/binance/service'

export type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  clientViewState$: typeof clientViewState$
  assetTxs$: typeof assetTxs$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
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
  assetTxs$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  transaction,
  freeze,
  transferFees$,
  freezeFee$
}

const BinanceContext = createContext<BinanceContextValue | null>(null)

export const BinanceProvider: React.FC = ({ children }): JSX.Element => {
  return <BinanceContext.Provider value={initialContext}>{children}</BinanceContext.Provider>
}

export const useBinanceContext = () => {
  const context = useContext(BinanceContext)
  if (!context) {
    throw new Error('Context must be used within a BinanceProvider.')
  }
  return context
}
