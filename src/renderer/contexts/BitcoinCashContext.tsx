import React, { createContext, useContext } from 'react'

import {
  client$,
  address$,
  balances$,
  reloadBalances,
  reloadFees,
  fees$,
  feesWithRates$
} from '../services/bitcoincash'

export type BitcoinCashContextValue = {
  client$: typeof client$
  address$: typeof address$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  fees$: typeof fees$
  feesWithRates$: typeof feesWithRates$
  reloadFees: typeof reloadFees
}

const initialContext: BitcoinCashContextValue = {
  client$,
  address$,
  reloadBalances,
  balances$,
  fees$,
  feesWithRates$,
  reloadFees
}

const BitcoinCashContext = createContext<BitcoinCashContextValue | null>(null)

export const BitcoinCashProvider: React.FC = ({ children }): JSX.Element => {
  return <BitcoinCashContext.Provider value={initialContext}>{children}</BitcoinCashContext.Provider>
}

export const useBitcoinCashContext = () => {
  const context = useContext(BitcoinCashContext)
  if (!context) {
    throw new Error('Context must be used within a BitcoinCashProvider.')
  }
  return context
}
