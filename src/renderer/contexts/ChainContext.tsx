import React, { createContext, useContext } from 'react'

import {
  stakeFees$,
  reloadStakeFees,
  unstakeFees$,
  reloadUnstakeFees,
  updateUnstakeFeesEffect$,
  updateStakeFeesEffect$,
  isCrossChainStake$
} from '../services/chain/context'

type ChainContextValue = {
  stakeFees$: typeof stakeFees$
  reloadStakeFees: typeof reloadStakeFees
  unstakeFees$: typeof unstakeFees$
  reloadUnstakeFees: typeof reloadUnstakeFees
  updateUnstakeFeesEffect$: typeof updateUnstakeFeesEffect$
  updateStakeFeesEffect$: typeof updateStakeFeesEffect$
  isCrossChainStake$: typeof isCrossChainStake$
}

const initialContext: ChainContextValue = {
  stakeFees$,
  reloadStakeFees,
  unstakeFees$,
  reloadUnstakeFees,
  updateUnstakeFeesEffect$,
  updateStakeFeesEffect$,
  isCrossChainStake$
}
const ChainContext = createContext<ChainContextValue | null>(null)

export const ChainProvider: React.FC = ({ children }): JSX.Element => {
  return <ChainContext.Provider value={initialContext}>{children}</ChainContext.Provider>
}

export const useChainContext = () => {
  const context = useContext(ChainContext)
  if (!context) {
    throw new Error('Context must be used within a ChainProvider.')
  }
  return context
}
