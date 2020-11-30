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
  ledgerMainnetAddress$,
  ledgerTestnetAddress$
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
  ledgerMainnetAddress$: typeof ledgerMainnetAddress$
  ledgerTestnetAddress$: typeof ledgerTestnetAddress$
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
  ledgerMainnetAddress$,
  ledgerTestnetAddress$
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
