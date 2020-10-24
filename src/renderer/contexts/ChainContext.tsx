import React, { createContext, useContext } from 'react'

import { stakeFees$, reloadFees } from '../services/chain/context'

type ChainContextValue = {
  stakeFees$: typeof stakeFees$
  reloadFees: typeof reloadFees
}

const initialContext: ChainContextValue = {
  stakeFees$,
  reloadFees
}
const ChainContext = createContext<ChainContextValue | null>(null)

export const ChainProvider: React.FC = ({ children }): JSX.Element => {
  return <ChainContext.Provider value={initialContext}>{children}</ChainContext.Provider>
}

export const useChainContext = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('Context must be used within a ChainProvider.')
  }
  return context
}
