import React, { createContext, useContext } from 'react'

import {
  client$,
  address$,
  reloadBalances,
  reloadFees,
  balances$,
  txRD$,
  fees$,
  subscribeTx,
  resetTx,
  ledgerAddress$,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx
} from '../services/bitcoin'

export type BitcoinContextValue = {
  client$: typeof client$
  address$: typeof address$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  fees$: typeof fees$
  txRD$: typeof txRD$
  subscribeTx: typeof subscribeTx
  reloadFees: typeof reloadFees
  resetTx: typeof resetTx
  ledgerAddress$: typeof ledgerAddress$
  ledgerTxRD$: typeof ledgerTxRD$
  pushLedgerTx: typeof pushLedgerTx
  resetLedgerTx: typeof resetLedgerTx
}

const initialContext: BitcoinContextValue = {
  client$,
  address$,
  reloadBalances,
  balances$,
  fees$,
  txRD$,
  subscribeTx,
  reloadFees,
  resetTx,
  ledgerAddress$,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx
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
