import React, { createContext, useContext } from 'react'

import {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  balances$
} from '../services/cosmos'

export type CosmosContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
  explorerUrl$: typeof explorerUrl$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
}

const initialContext: CosmosContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  balances$
}

const CosmosContext = createContext<CosmosContextValue | null>(null)

export const CosmosProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <CosmosContext.Provider value={initialContext}>{children}</CosmosContext.Provider>
}

export const useCosmosContext = () => {
  const context = useContext(CosmosContext)
  if (!context) {
    throw new Error('Context must be used within a CosmosProvider.')
  }
  return context
}
