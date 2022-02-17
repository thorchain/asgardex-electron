import React, { createContext, useContext } from 'react'

import {
  client$,
  clientState$,
  address$,
  addressUI$,
  reloadBalances,
  balances$,
  getBalanceByAddress$,
  txRD$,
  reloadFees,
  fees$,
  feesWithRates$,
  reloadFeesWithRates,
  subscribeTx,
  resetTx,
  ledgerAddress$,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx,
  explorerUrl$
} from '../services/bitcoin'

export type BitcoinContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  getBalanceByAddress$: typeof getBalanceByAddress$
  reloadFees: typeof reloadFees
  fees$: typeof fees$
  reloadFeesWithRates: typeof reloadFeesWithRates
  feesWithRates$: typeof feesWithRates$
  txRD$: typeof txRD$
  subscribeTx: typeof subscribeTx
  resetTx: typeof resetTx
  ledgerAddress$: typeof ledgerAddress$
  ledgerTxRD$: typeof ledgerTxRD$
  pushLedgerTx: typeof pushLedgerTx
  resetLedgerTx: typeof resetLedgerTx
  explorerUrl$: typeof explorerUrl$
}

const initialContext: BitcoinContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,
  reloadBalances,
  balances$,
  getBalanceByAddress$,
  reloadFees,
  fees$,
  reloadFeesWithRates,
  feesWithRates$,
  txRD$,
  subscribeTx,
  resetTx,
  ledgerAddress$,
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx,
  explorerUrl$
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
