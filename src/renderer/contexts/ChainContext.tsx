import React, { createContext, useContext } from 'react'

import {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees,
  swapFees$,
  subscribeTx,
  txRD$,
  resetTx,
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$
} from '../services/chain'

type ChainContextValue = {
  addressByChain$: typeof addressByChain$
  clientByChain$: typeof clientByChain$
  depositFees$: typeof depositFees$
  reloadDepositFees: typeof reloadDepositFees
  withdrawFees$: typeof withdrawFees$
  reloadWithdrawFees: typeof reloadWithdrawFees
  reloadDepositFeesEffect$: typeof reloadDepositFeesEffect$
  isCrossChainDeposit$: typeof isCrossChainDeposit$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
  retrieveLedgerAddress: typeof retrieveLedgerAddress
  removeLedgerAddress: typeof removeLedgerAddress
  removeAllLedgerAddress: typeof removeAllLedgerAddress
  reloadSwapFees: typeof reloadSwapFees
  swapFees$: typeof swapFees$
  subscribeTx: typeof subscribeTx
  txRD$: typeof txRD$
  resetTx: typeof resetTx
  getExplorerUrlByAsset$: typeof getExplorerUrlByAsset$
  assetAddress$: typeof assetAddress$
  swap$: typeof swap$
}

const initialContext: ChainContextValue = {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees: reloadSwapFees,
  swapFees$,
  subscribeTx,
  txRD$,
  resetTx,
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$
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
