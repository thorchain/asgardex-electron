import React, { createContext, useContext } from 'react'

import { useSubscription } from 'observable-hooks'

import { setKeystoreState, client$, setNetworkState, address$ } from '../services/ethereum/service'
import { useAppContext } from './AppContext'
import { useWalletContext } from './WalletContext'

export type EthereumContextValue = {
  client$: typeof client$
  address$: typeof address$
}

const initialContext: EthereumContextValue = {
  client$,
  address$
}

const EthereumContext = createContext<EthereumContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const EthereumProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { network$ } = useAppContext()
  // Note: Service does need to subscribe to latest state of keystore and network!
  useSubscription(network$, (network) => setNetworkState(network))
  useSubscription(keystoreService.keystore$, (keystore) => setKeystoreState(keystore))

  return <EthereumContext.Provider value={initialContext}>{children}</EthereumContext.Provider>
}

export const useEthereumContext = () => {
  const context = useContext(EthereumContext)
  if (!context) {
    throw new Error('Context must be used within a EthereumProvider.')
  }
  return context
}
