import React, { createContext, useContext } from 'react'

import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import { phrase, lock, unlock, locked$, isLocked$ } from '../services/wallet/service'
import { PhraseService } from '../services/wallet/types'

type WalletContextValue = {
  phrase: PhraseService
  isLocked$: typeof isLocked$
  locked$: typeof locked$
  lock: typeof lock
  unlock: typeof unlock
}

const initialContext: WalletContextValue = {
  phrase,
  isLocked$,
  lock,
  unlock,
  locked$
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
