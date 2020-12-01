import React, { createContext, useContext } from 'react'

import {
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  updateDepositFeesEffect$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress
} from '../services/chain/index'

type ChainContextValue = {
  clientByChain$: typeof clientByChain$
  depositFees$: typeof depositFees$
  reloadDepositFees: typeof reloadDepositFees
  withdrawFees$: typeof withdrawFees$
  reloadWithdrawFees: typeof reloadWithdrawFees
  updateWithdrawFeesEffect$: typeof updateWithdrawFeesEffect$
  updateDepositFeesEffect$: typeof updateDepositFeesEffect$
  isCrossChainDeposit$: typeof isCrossChainDeposit$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
  retrieveLedgerAddress: typeof retrieveLedgerAddress
  removeLedgerAddress: typeof removeLedgerAddress
  removeAllLedgerAddress: typeof removeAllLedgerAddress
}

const initialContext: ChainContextValue = {
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  updateDepositFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress
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
