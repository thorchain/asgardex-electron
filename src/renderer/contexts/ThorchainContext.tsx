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
  interact$
} from '../services/thorchain'

export type ThorchainContextValue = {
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
  interact$: typeof interact$
}

const initialContext: ThorchainContextValue = {
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
  interact$
}

const ThorchainContext = createContext<ThorchainContextValue | null>(null)

export const ThorchainProvider: React.FC = ({ children }): JSX.Element => {
  return <ThorchainContext.Provider value={initialContext}>{children}</ThorchainContext.Provider>
}

export const useThorchainContext = () => {
  const context = useContext(ThorchainContext)
  if (!context) {
    throw new Error('Context must be used within a ThorchainProvider.')
  }
  return context
}
