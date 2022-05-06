import React, { createContext, useContext } from 'react'

import {
  onlineStatus$,
  network$,
  changeNetwork,
  clientNetwork$,
  slipTolerance$,
  changeSlipTolerance
} from '../services/app/service'
import { ChangeNetworkHandler, ChangeSlipToleranceHandler } from '../services/app/types'

type AppContextValue = {
  onlineStatus$: typeof onlineStatus$
  network$: typeof network$
  changeNetwork: ChangeNetworkHandler
  clientNetwork$: typeof clientNetwork$
  slipTolerance$: typeof slipTolerance$
  changeSlipTolerance: ChangeSlipToleranceHandler
}
const initialContext: AppContextValue = {
  onlineStatus$,
  network$,
  changeNetwork,
  clientNetwork$,
  slipTolerance$,
  changeSlipTolerance
}

const AppContext = createContext<AppContextValue | null>(null)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => (
  <AppContext.Provider value={initialContext}>{children}</AppContext.Provider>
)

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('Context must be used within a AppProvider.')
  }
  return context
}
