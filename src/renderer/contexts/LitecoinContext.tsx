import React, { createContext, useContext } from 'react'

import {
  address$,
  client$,
  balances$,
  reloadBalances,
  txs$,
  reloadFees,
  fees$,
  txRD$,
  sendTx,
  resetTx,
  subscribeTx,
  explorerUrl$
} from '../services/litecoin'

export type LitecoinContextValue = {
  address$: typeof address$
  client$: typeof client$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  txs$: typeof txs$
  reloadFees: typeof reloadFees
  fees$: typeof fees$
  subscribeTx: typeof subscribeTx
  resetTx: typeof resetTx
  sendTx: typeof sendTx
  txRD$: typeof txRD$
  explorerUrl$: typeof explorerUrl$
}

const initialContext: LitecoinContextValue = {
  address$,
  client$,
  reloadBalances,
  balances$,
  txs$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  reloadFees,
  fees$,
  explorerUrl$
}

const LitecoinContext = createContext<LitecoinContextValue>(initialContext)

export const LitecoinProvider: React.FC = ({ children }): JSX.Element => {
  return <LitecoinContext.Provider value={initialContext}>{children}</LitecoinContext.Provider>
}

export const useLitecoinContext = () => {
  const context = useContext(LitecoinContext)
  if (!context) {
    throw new Error('Context must be used within a LitecoinProvider.')
  }
  return context
}
