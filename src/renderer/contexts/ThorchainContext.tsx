import React, { createContext, useContext } from 'react'

import {
  client$,
  clientState$,
  address$,
  addressUI$,
  balances$,
  reloadBalances,
  txs$,
  reloadFees,
  fees$,
  txRD$,
  sendTx,
  resetTx,
  subscribeTx,
  interact$,
  getNodeInfo$,
  reloadNodesInfo,
  explorerUrl$,
  mimir$,
  reloadMimir,
  getLiquidityProvider,
  reloadLiquidityProviders
} from '../services/thorchain'

export type ThorchainContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
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
  getNodeInfo$: typeof getNodeInfo$
  explorerUrl$: typeof explorerUrl$
  reloadNodesInfo: typeof reloadNodesInfo
  mimir$: typeof mimir$
  reloadMimir: typeof reloadMimir
  getLiquidityProvider: typeof getLiquidityProvider
  reloadLiquidityProviders: typeof reloadLiquidityProviders
}

const initialContext: ThorchainContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,
  reloadBalances,
  balances$,
  txs$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  reloadFees,
  fees$,
  interact$,
  getNodeInfo$,
  explorerUrl$,
  reloadNodesInfo,
  mimir$,
  reloadMimir,
  getLiquidityProvider: getLiquidityProvider,
  reloadLiquidityProviders: reloadLiquidityProviders
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
