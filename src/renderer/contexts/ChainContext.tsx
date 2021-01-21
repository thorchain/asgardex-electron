import React, { createContext, useContext } from 'react'

import {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
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
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  txStatus$
} from '../services/chain'

type ChainContextValue = {
  addressByChain$: typeof addressByChain$
  clientByChain$: typeof clientByChain$
  depositFees$: typeof depositFees$
  reloadDepositFees: typeof reloadDepositFees
  withdrawFees$: typeof withdrawFees$
  reloadWithdrawFees: typeof reloadWithdrawFees
  reloadDepositFeesEffect$: typeof reloadDepositFeesEffect$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
  retrieveLedgerAddress: typeof retrieveLedgerAddress
  removeLedgerAddress: typeof removeLedgerAddress
  removeAllLedgerAddress: typeof removeAllLedgerAddress
  reloadSwapFees: typeof reloadSwapFees
  swapFees$: typeof swapFees$
  getExplorerUrlByAsset$: typeof getExplorerUrlByAsset$
  assetAddress$: typeof assetAddress$
  swap$: typeof swap$
  asymDeposit$: typeof asymDeposit$
  symDeposit$: typeof symDeposit$
  txStatus$: typeof txStatus$
}

const initialContext: ChainContextValue = {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees: reloadSwapFees,
  swapFees$,
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  txStatus$
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
