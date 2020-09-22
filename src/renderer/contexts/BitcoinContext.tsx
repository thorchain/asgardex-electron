import React, { createContext, useContext } from 'react'

import { client$, clientViewState$, address$ } from '../services/bitcoin'

export type BitcoinContextValue = {
  clientViewState$: typeof clientViewState$
  client$: typeof client$
  address$: typeof address$
}

const initialContext: BitcoinContextValue = {
  client$,
  clientViewState$,
  address$
}

const BitcoinContext = createContext<BitcoinContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const BitcoinProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  return <BitcoinContext.Provider value={initialContext}>{children}</BitcoinContext.Provider>
}

export const useBitcoinContext = () => {
  const context = useContext(BitcoinContext)
  if (!context) {
    throw new Error('Context must be used within a BitcoinProvider.')
  }
  return context
}
