import React, { createContext, useContext } from 'react'

import { onlineStatus$, network$, changeNetwork, clientNetwork$ } from '../services/app/service'
import { appUpdater$, resetAppUpdater } from '../services/appUpdate'

type AppContextValue = {
  onlineStatus$: typeof onlineStatus$
  network$: typeof network$
  changeNetwork: typeof changeNetwork
  clientNetwork$: typeof clientNetwork$
  appUpdater$: typeof appUpdater$
  resetAppUpdater: typeof resetAppUpdater
}
const initialContext: AppContextValue = {
  onlineStatus$,
  network$,
  changeNetwork,
  clientNetwork$,
  appUpdater$,
  resetAppUpdater
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider: React.FC = ({ children }): JSX.Element => (
  <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>
)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('Context must be used within a AppProvider.')
  }
  return context
}
