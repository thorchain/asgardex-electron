import React, { createContext, useContext } from 'react'

import {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  getWithdrawMemo$,
  withdrawFee$,
  reloadWithdrawFee,
  reloadDepositFeesEffect$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees,
  swapFees$,
  getExplorerUrlByAsset$,
  getExplorerAddressByChain$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeBnbRune$,
  symWithdraw$
} from '../services/chain'

type ChainContextValue = {
  addressByChain$: typeof addressByChain$
  clientByChain$: typeof clientByChain$
  depositFees$: typeof depositFees$
  reloadDepositFees: typeof reloadDepositFees
  withdrawFee$: typeof withdrawFee$
  reloadWithdrawFees: typeof reloadWithdrawFee
  reloadDepositFeesEffect$: typeof reloadDepositFeesEffect$
  symDepositTxMemo$: typeof symDepositTxMemo$
  asymDepositTxMemo$: typeof asymDepositTxMemo$
  getWithdrawMemo$: typeof getWithdrawMemo$
  retrieveLedgerAddress: typeof retrieveLedgerAddress
  removeLedgerAddress: typeof removeLedgerAddress
  removeAllLedgerAddress: typeof removeAllLedgerAddress
  reloadSwapFees: typeof reloadSwapFees
  swapFees$: typeof swapFees$
  getExplorerUrlByAsset$: typeof getExplorerUrlByAsset$
  getExplorerAddressByChain$: typeof getExplorerAddressByChain$
  assetAddress$: typeof assetAddress$
  swap$: typeof swap$
  asymDeposit$: typeof asymDeposit$
  symDeposit$: typeof symDeposit$
  upgradeBnbRune$: typeof upgradeBnbRune$
  symWithdraw$: typeof symWithdraw$
}

const initialContext: ChainContextValue = {
  addressByChain$,
  clientByChain$,
  depositFees$,
  reloadDepositFees,
  withdrawFee$,
  reloadWithdrawFees: reloadWithdrawFee,
  reloadDepositFeesEffect$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  getWithdrawMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees: reloadSwapFees,
  swapFees$,
  getExplorerUrlByAsset$,
  getExplorerAddressByChain$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeBnbRune$,
  symWithdraw$
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
