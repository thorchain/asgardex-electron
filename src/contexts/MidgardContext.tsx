import React, { createContext, useContext } from 'react'

import { reloadPoolData, poolState$ } from '../services/midgard'

type MidgardContextValue = {
  reloadPoolData: typeof reloadPoolData
  poolState$: typeof poolState$
}

const initialContext: MidgardContextValue = {
  poolState$,
  reloadPoolData
}
const MidgardContext = createContext<MidgardContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const MidgardProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <MidgardContext.Provider value={initialContext}>{children}</MidgardContext.Provider>
)

export const useMidgardContext = () => {
  const context = useContext(MidgardContext)
  if (!context) {
    throw new Error('Context must be used within a MidgardProvider.')
  }
  return context
}
