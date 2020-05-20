import React, { createContext, useContext } from 'react'
import { subscribeTransfers, miniTickers$, MiniTickersEventData } from '../services/binance'
import { Observable } from 'rxjs'

type BinanceContextValue = {
  subscribeTransfers: typeof subscribeTransfers
  miniTickers$: Observable<MiniTickersEventData[]>
}

const initialContext: BinanceContextValue = {
  subscribeTransfers,
  miniTickers$
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
