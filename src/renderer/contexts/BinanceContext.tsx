import React, { createContext, useContext } from 'react'

import {
  client$,
  clientViewState$,
  subscribeTransfers,
  miniTickers$,
  txs$,
  resetTx,
  pushTx,
  sendStakeTx,
  txRD$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$
} from '../services/binance'

export type BinanceContextValue = {
  client$: typeof client$
  clientViewState$: typeof clientViewState$
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  txs$: typeof txs$
  resetTx: typeof resetTx
  pushTx: typeof pushTx
  sendStakeTx: typeof sendStakeTx
  txRD$: typeof txRD$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  fees$: typeof fees$
}

const initialContext: BinanceContextValue = {
  client$,
  clientViewState$,
  subscribeTransfers,
  miniTickers$,
  txs$,
  resetTx,
  pushTx,
  sendStakeTx,
  txRD$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$
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
