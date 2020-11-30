import React, { createContext, useContext } from 'react'

import {
  client$,
  balances$,
  reloadBalances,
  txs$,
  reloadFees,
  fees$,
  txRD$,
  sendDepositTx,
  resetTx,
  pushTx
} from '../services/thorchain'

export type ThorchainContextValue = {
  client$: typeof client$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  txs$: typeof txs$
  reloadFees: typeof reloadFees
  fees$: typeof fees$
  pushTx: typeof pushTx
  resetTx: typeof resetTx
  sendDepositTx: typeof sendDepositTx
  txRD$: typeof txRD$
}

const initialContext: ThorchainContextValue = {
  client$,
  reloadBalances,
  balances$,
  txs$,
  pushTx,
  resetTx,
  sendDepositTx,
  txRD$,
  reloadFees,
  fees$
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
