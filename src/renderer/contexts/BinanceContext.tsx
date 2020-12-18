import React, { createContext, useContext } from 'react'

import {
  client$,
  clientViewState$,
  subscribeTransfers,
  miniTickers$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$,
  ledgerAddress$
} from '../services/binance'

export type BinanceContextValue = {
  client$: typeof client$
  clientViewState$: typeof clientViewState$
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: typeof miniTickers$
  txs$: typeof txs$
  resetTx: typeof resetTx
  subscribeTx: typeof subscribeTx
  sendTx: typeof sendTx
  txRD$: typeof txRD$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  fees$: typeof fees$
  ledgerAddress$: typeof ledgerAddress$
}

const initialContext: BinanceContextValue = {
  client$,
  clientViewState$,
  subscribeTransfers,
  miniTickers$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$,
  ledgerAddress$
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
