import React, { createContext, useContext } from 'react'

import {
  stakeFees$,
  reloadStakeFees,
  isCrossChainStake$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  updateStakeFeesEffect$
} from '../services/chain/context'

type ChainContextValue = {
  stakeFees$: typeof stakeFees$
  reloadStakeFees: typeof reloadStakeFees
  withdrawFees$: typeof withdrawFees$
  reloadWithdrawFees: typeof reloadWithdrawFees
  updateWithdrawFeesEffect$: typeof updateWithdrawFeesEffect$
  updateStakeFeesEffect$: typeof updateStakeFeesEffect$
  isCrossChainStake$: typeof isCrossChainStake$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
}

const initialContext: ChainContextValue = {
  stakeFees$,
  reloadStakeFees,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  updateStakeFeesEffect$,
  isCrossChainStake$,
  symDepositTxMemo$,
  asymDepositTxMemo$
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
