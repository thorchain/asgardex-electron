import React, { createContext, useContext } from 'react'

import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import { reloadBalances, assetsWBState$, assetsWBChains$ } from '../services/wallet/balances'
import { keystoreService } from '../services/wallet/service'

type WalletContextValue = {
  keystoreService: typeof keystoreService
  reloadBalances: typeof reloadBalances
  assetsWBState$: typeof assetsWBState$
  assetsWBChains$: typeof assetsWBChains$
}

const initialContext: WalletContextValue = {
  keystoreService,
  reloadBalances,
  assetsWBState$,
  assetsWBChains$
}
const WalletContext = createContext<Option<WalletContextValue>>(none)

type Props = {
  children: React.ReactNode
}

export const WalletProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <WalletContext.Provider value={some(initialContext)}>{children}</WalletContext.Provider>
)

export const useWalletContext = () => {
  const context = O.toNullable(useContext(WalletContext))
  if (!context) {
    throw new Error('Context must be used within a WalletProvider.')
  }
  return context
}
