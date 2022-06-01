import React, { createContext, useContext } from 'react'

import { service } from '../services/midgard/service'
import { pools as poolsStorage } from '../services/storage'

type MidgardContextValue = {
  service: typeof service
  storage: { pools: typeof poolsStorage }
}

const initialContext: MidgardContextValue = {
  service,
  storage: { pools: poolsStorage }
}
const MidgardContext = createContext<MidgardContextValue | null>(null)

export const MidgardProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <MidgardContext.Provider value={initialContext}>{children}</MidgardContext.Provider>
}

export const useMidgardContext = () => {
  const context = useContext(MidgardContext)
  if (!context) {
    throw new Error('Context must be used within a MidgardProvider.')
  }
  return context
}
