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
  reloadDepositFeesEffect$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  feesByAssetChain$,
  reloadChainFees
} from '../services/chain'

type ChainContextValue = {
  clientByChain$: typeof clientByChain$
  depositFees$: typeof depositFees$
  reloadDepositFees: typeof reloadDepositFees
  withdrawFees$: typeof withdrawFees$
  reloadWithdrawFees: typeof reloadWithdrawFees
  updateWithdrawFeesEffect$: typeof updateWithdrawFeesEffect$
  reloadDepositFeesEffect$: typeof reloadDepositFeesEffect$
  isCrossChainDeposit$: typeof isCrossChainDeposit$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
  retrieveLedgerAddress: typeof retrieveLedgerAddress
  removeLedgerAddress: typeof removeLedgerAddress
  removeAllLedgerAddress: typeof removeAllLedgerAddress
  feesByAssetChain$: typeof feesByAssetChain$
  reloadChainFees: typeof reloadChainFees
}

const initialContext: ChainContextValue = {
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  withdrawFees$,
  reloadWithdrawFees,
  updateWithdrawFeesEffect$,
  reloadDepositFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  feesByAssetChain$: feesByAssetChain$,
  reloadChainFees: reloadChainFees
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
