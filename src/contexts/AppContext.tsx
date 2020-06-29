import React, { createContext, useContext } from 'react'

import { onlineStatus$, network$ } from '../services/app/service'

type AppContextValue = {
  onlineStatus$: typeof onlineStatus$
  network$: typeof network$
}
const initialContext: AppContextValue = {
  onlineStatus$,
  network$
}

const AppContext = createContext<AppContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const AppProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>
)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('Context must be used within a AppProvider.')
  }
  return context
}
