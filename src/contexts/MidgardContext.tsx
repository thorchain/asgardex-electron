import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import { service } from '../services/midgard/service'
import { useAppContext } from './AppContext'

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

export const MidgardProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const { network$ } = useAppContext()
  // Note: Service does need to subscribe to latest state of keystore and network!
  useSubscription(network$, (network) => service.setNetworkState(network))

  return <MidgardContext.Provider value={initialContext}>{children}</MidgardContext.Provider>
}

export const useMidgardContext = () => {
  const context = useContext(MidgardContext)
  if (!context) {
    throw new Error('Context must be used within a MidgardProvider.')
  }
  return context
}
