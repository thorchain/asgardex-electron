import React, { createContext, useContext } from 'react'

import {
  address$,
  addressUI$,
  client$,
  balances$,
  reloadBalances,
  txs$,
  reloadFees,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  txRD$,
  sendTx,
  resetTx,
  subscribeTx,
  explorerUrl$
} from '../services/litecoin'

export type LitecoinContextValue = {
  address$: typeof address$
  addressUI$: typeof addressUI$
  client$: typeof client$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  txs$: typeof txs$
  reloadFees: typeof reloadFees
  fees$: typeof fees$
  reloadFeesWithRates: typeof reloadFeesWithRates
  feesWithRates$: typeof feesWithRates$
  subscribeTx: typeof subscribeTx
  resetTx: typeof resetTx
  sendTx: typeof sendTx
  txRD$: typeof txRD$
  explorerUrl$: typeof explorerUrl$
}

const initialContext: LitecoinContextValue = {
  address$,
  addressUI$,
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
  reloadFeesWithRates,
  feesWithRates$,
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
