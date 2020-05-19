import React, { createContext, useContext } from 'react'
import { subscribeTransfers, subscribeTickers } from '../services/binance'

type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  subscribeTickers: typeof subscribeTickers
}

const initialContext: BinanceContextValue = {
  subscribeTransfers,
  subscribeTickers
}
const BinanceContext = createContext<BinanceContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const BinanceProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <BinanceContext.Provider value={initialContext}>{children}</BinanceContext.Provider>
)

export const useBinanceContext = () => {
  const context = useContext(BinanceContext)
  if (!context) {
    throw new Error('Context must be used within a BinanceProvider.')
  }
  return context
}
