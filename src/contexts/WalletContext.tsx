import React, { createContext, useContext } from 'react'

type WalletContextValue = {
  phrase: string
}

const initialContext: WalletContextValue = {
  phrase: ''
}
const WalletContext = createContext<WalletContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const WalletProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <WalletContext.Provider value={initialContext}>{children}</WalletContext.Provider>
)

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('Context must be used within a WalletProvider.')
  }
  return context
}
