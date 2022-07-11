import React, { createContext, useContext } from 'react'

import { userNodes as service } from '../services/storage'

type UserNodesContextValue = typeof service

const initialContext: UserNodesContextValue = service
const UserNodesContext = createContext<UserNodesContextValue | null>(null)

export const UserNodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <UserNodesContext.Provider value={initialContext}>{children}</UserNodesContext.Provider>
}

export const useUserNodesContext = () => {
  const context = useContext(UserNodesContext)
  if (!context) {
    throw new Error('Context must be used within a UserNodesProvider.')
  }
  return context
}
