import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import { client$, setNetworkState, address$ } from '../services/ethereum/service'
import { useAppContext } from './AppContext'

export type EthereumContextValue = {
  client$: typeof client$
  address$: typeof address$
}

const initialContext: EthereumContextValue = {
  client$,
  address$
}

const EthereumContext = createContext<EthereumContextValue | null>(null)

export const EthereumProvider: React.FC = ({ children }): JSX.Element => {
  const { network$ } = useAppContext()
  useSubscription(network$, (network) => setNetworkState(network))
  return <EthereumContext.Provider value={initialContext}>{children}</EthereumContext.Provider>
}

export const useEthereumContext = () => {
  const context = useContext(EthereumContext)
  if (!context) {
    throw new Error('Context must be used within a EthereumProvider.')
  }
  return context
}
