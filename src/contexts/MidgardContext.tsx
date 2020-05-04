import React, { createContext, useContext } from 'react'
import { pools$, reloadPools } from '../services/midgard'

type MidgardContextValue = {
  pools$: typeof pools$
  reloadPools: typeof reloadPools
}

const initialContext: MidgardContextValue = {
  pools$,
  reloadPools
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
