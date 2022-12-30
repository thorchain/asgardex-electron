import React, { createContext, useContext } from 'react'

import {
  addressByChain$,
  clientByChain$,
  symDepositFees$,
  reloadSymDepositFees,
  asymDepositFee$,
  reloadAsymDepositFee,
  symWithdrawFee$,
  reloadWithdrawFees,
  reloadSwapFees,
  swapFees$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeRuneToNative$,
  symWithdraw$,
  asymWithdraw$,
  transfer$,
  assetWithDecimal$
} from '../services/chain'

type ChainContextValue = {
  addressByChain$: typeof addressByChain$
  clientByChain$: typeof clientByChain$
  symDepositFees$: typeof symDepositFees$
  reloadSymDepositFees: typeof reloadSymDepositFees
  asymDepositFee$: typeof asymDepositFee$
  reloadAsymDepositFee: typeof reloadAsymDepositFee
  symWithdrawFee$: typeof symWithdrawFee$
  reloadWithdrawFees: typeof reloadWithdrawFees
  reloadSwapFees: typeof reloadSwapFees
  swapFees$: typeof swapFees$
  assetAddress$: typeof assetAddress$
  swap$: typeof swap$
  asymDeposit$: typeof asymDeposit$
  symDeposit$: typeof symDeposit$
  upgradeRuneToNative$: typeof upgradeRuneToNative$
  symWithdraw$: typeof symWithdraw$
  asymWithdraw$: typeof asymWithdraw$
  transfer$: typeof transfer$
  assetWithDecimal$: typeof assetWithDecimal$
}

const initialContext: ChainContextValue = {
  addressByChain$,
  clientByChain$,
  symDepositFees$,
  reloadSymDepositFees,
  asymDepositFee$,
  reloadAsymDepositFee,
  symWithdrawFee$,
  reloadWithdrawFees,
  reloadSwapFees,
  swapFees$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeRuneToNative$,
  symWithdraw$,
  asymWithdraw$,
  transfer$,
  assetWithDecimal$
}
const ChainContext = createContext<ChainContextValue | null>(null)

export const ChainProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <ChainContext.Provider value={initialContext}>{children}</ChainContext.Provider>
}

export const useChainContext = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('Context must be used within a ChainProvider.')
  }
  return context
}
