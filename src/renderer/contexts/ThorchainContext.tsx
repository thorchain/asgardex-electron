import React, { createContext, useContext } from 'react'

import { client$ } from '../services/thorchain'

export type ThorchainContextValue = {
  client$: typeof client$
}

const initialContext: ThorchainContextValue = {
  client$
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
