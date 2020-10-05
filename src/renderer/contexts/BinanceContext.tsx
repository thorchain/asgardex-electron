import React, { createContext, useContext } from 'react'

import {
  subscribeTransfers,
  miniTickers$,
  client$,
  clientViewState$,
  address$,
  assetTxs$,
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
  assetTxs$: typeof assetTxs$
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
  assetTxs$,
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
