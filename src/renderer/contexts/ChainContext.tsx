import React, { createContext, useContext } from 'react'

import {
  stakeFees$,
  reloadStakeFees,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  updateStakeFeesEffect$,
  isCrossChainStake$
} from '../services/chain/context'

type ChainContextValue = {
  stakeFees$: typeof stakeFees$
  reloadStakeFees: typeof reloadStakeFees
  withdrawFees$: typeof withdrawFees$
  reloadUnstakeFees: typeof reloadWithdrawFees
  updateUnstakeFeesEffect$: typeof updateWithdrawFeesEffect$
  updateStakeFeesEffect$: typeof updateStakeFeesEffect$
  isCrossChainStake$: typeof isCrossChainStake$
}

const initialContext: ChainContextValue = {
  stakeFees$,
  reloadStakeFees,
  withdrawFees$: withdrawFees$,
  reloadUnstakeFees: reloadWithdrawFees,
  updateUnstakeFeesEffect$: updateWithdrawFeesEffect$,
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
