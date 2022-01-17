import React, { createContext, useContext } from 'react'

import { client$, clientState$, address$, addressUI$, explorerUrl$ } from '../services/doge'

export type DogeContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  address$: typeof address$
  addressUI$: typeof addressUI$
  explorerUrl$: typeof explorerUrl$
}

const initialContext: DogeContextValue = {
  client$,
  clientState$,
  address$,
  addressUI$,

  explorerUrl$
}

const DogeContext = createContext<DogeContextValue | null>(null)

export const DogeProvider: React.FC = ({ children }): JSX.Element => {
  return <DogeContext.Provider value={initialContext}>{children}</DogeContext.Provider>
}

export const useDogeContext = () => {
  const context = useContext(DogeContext)
  if (!context) {
    throw new Error('Context must be used within a DogeProvider.')
  }
  return context
}
