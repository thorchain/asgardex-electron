import React, { createContext, useContext } from 'react'

import {
  client$,
  clientState$,
  address$,
  addressUI$,
  balances$,
  reloadBalances,
  reloadFees,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  explorerUrl$
} from '../services/bitcoincash'

export type BitcoinCashContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  fees$: typeof fees$
  reloadFeesWithRates: typeof reloadFeesWithRates
  feesWithRates$: typeof feesWithRates$
  reloadFees: typeof reloadFees
  explorerUrl$: typeof explorerUrl$
}

const initialContext: BitcoinCashContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,
  reloadBalances,
  balances$,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  reloadFees,
  explorerUrl$
}

const BitcoinCashContext = createContext<BitcoinCashContextValue | null>(null)

export const BitcoinCashProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <BitcoinCashContext.Provider value={initialContext}>{children}</BitcoinCashContext.Provider>
}

export const useBitcoinCashContext = () => {
  const context = useContext(BitcoinCashContext)
  if (!context) {
    throw new Error('Context must be used within a BitcoinCashProvider.')
  }
  return context
}
