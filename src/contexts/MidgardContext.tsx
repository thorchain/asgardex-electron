import React, { createContext, useContext } from 'react'

import service from '../services/midgard/service'

type MidgardContextValue = {
  service: typeof service
}

const initialContext: MidgardContextValue = {
  service
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
