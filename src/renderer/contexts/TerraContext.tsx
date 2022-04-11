import React, { createContext, useContext } from 'react'

import {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  balances$,
  fees$,
  reloadFees
} from '../services/terra'

export type TerraContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
  explorerUrl$: typeof explorerUrl$
  reloadBalances: typeof reloadBalances
  balances$: typeof balances$
  fees$: typeof fees$
  reloadFees: typeof reloadFees
}

const initialContext: TerraContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  reloadBalances,
  balances$,
  fees$,
  reloadFees
}

const TerraContext = createContext<TerraContextValue | null>(null)

export const TerraProvider: React.FC = ({ children }): JSX.Element => {
  return <TerraContext.Provider value={initialContext}>{children}</TerraContext.Provider>
}

export const useTerraContext = () => {
  const context = useContext(TerraContext)
  if (!context) {
    throw new Error('Context must be used within a TerraProvider.')
  }
  return context
}
