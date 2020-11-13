import React, { createContext, useContext } from 'react'

import {
  subscribeTransfers,
  miniTickers$,
  client$,
  clientViewState$,
  address$,
  txs$,
  getExplorerTxUrl$,
  transaction,
  transferFees$,
  explorerUrl$
} from '../services/binance/service'

export type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  clientViewState$: typeof clientViewState$
  txs$: typeof txs$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  transaction: typeof transaction
  client$: typeof client$
  transferFees$: typeof transferFees$
}

const initialContext: BinanceContextValue = {
  subscribeTransfers,
  miniTickers$,
  client$,
  clientViewState$,
  txs$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  transaction,
  transferFees$
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
