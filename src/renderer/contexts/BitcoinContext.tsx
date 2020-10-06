import React, { createContext, useContext } from 'react'

import {
  client$,
  address$,
  reloadBalances,
  reloadFees,
  assetWB$,
  txRD$,
  fees$,
  pushTx,
  explorerUrl$,
  resetTx
} from '../services/bitcoin/context'

export type BitcoinContextValue = {
  client$: typeof client$
  address$: typeof address$
  explorerUrl$: typeof explorerUrl$
  reloadBalances: typeof reloadBalances
  assetWB$: typeof assetWB$
  fees$: typeof fees$
  txRD$: typeof txRD$
  pushTx: typeof pushTx
  reloadFees: typeof reloadFees
  resetTx: typeof resetTx
}

const initialContext: BitcoinContextValue = {
  client$,
  address$,
  explorerUrl$,
  reloadBalances,
  assetWB$,
  fees$,
  txRD$,
  pushTx,
  reloadFees,
  resetTx
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
