import React, { createContext, useContext } from 'react'

import {
  client$,
  address$,
  reloadBalances,
  reloadFees,
  balances$,
  txRD$,
  fees$,
  pushTx,
  resetTx,
  ledgerAddress$
} from '../services/bitcoin'

export type BitcoinContextValue = {
  client$: typeof client$
  address$: typeof address$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  fees$: typeof fees$
  txRD$: typeof txRD$
  pushTx: typeof pushTx
  reloadFees: typeof reloadFees
  resetTx: typeof resetTx
  ledgerAddress$: typeof ledgerAddress$
}

const initialContext: BitcoinContextValue = {
  client$,
  address$,
  reloadBalances,
  balances$,
  fees$,
  txRD$,
  pushTx,
  reloadFees,
  resetTx,
  ledgerAddress$
}

const BitcoinContext = createContext<BitcoinContextValue | null>(null)

export const BitcoinProvider: React.FC = ({ children }): JSX.Element => {
  return <BitcoinContext.Provider value={initialContext}>{children}</BitcoinContext.Provider>
}

export const useBitcoinContext = () => {
  const context = useContext(BitcoinContext)
  if (!context) {
    throw new Error('Context must be used within a BitcoinProvider.')
  }
  return context
}
