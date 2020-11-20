import React, { createContext, useContext } from 'react'

import {
  client$,
  address$,
  reloadBalances,
  reloadFees,
  assetsWB$,
  txRD$,
  fees$,
  pushTx,
  resetTx
} from '../services/bitcoin'

export type BitcoinContextValue = {
  client$: typeof client$
  address$: typeof address$
  reloadBalances: typeof reloadBalances
  assetsWB$: typeof assetsWB$
  fees$: typeof fees$
  txRD$: typeof txRD$
  pushTx: typeof pushTx
  reloadFees: typeof reloadFees
  resetTx: typeof resetTx
}

const initialContext: BitcoinContextValue = {
  client$,
  address$,
  reloadBalances,
  assetsWB$,
  fees$,
  txRD$,
  pushTx,
  reloadFees,
  resetTx
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
