import React, { createContext, useContext } from 'react'

import {
  client$,
  clientViewState$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$,
  reloadFees,
  sendDepositTx$,
  approveERC20Token$,
  isApprovedERC20Token$
} from '../services/ethereum'

export type EthereumContextValue = {
  client$: typeof client$
  clientViewState$: typeof clientViewState$
  txs$: typeof txs$
  resetTx: typeof resetTx
  subscribeTx: typeof subscribeTx
  sendTx: typeof sendTx
  txRD$: typeof txRD$
  address$: typeof address$
  addressUI$: typeof addressUI$
  explorerUrl$: typeof explorerUrl$
  getExplorerTxUrl$: typeof getExplorerTxUrl$
  fees$: typeof fees$
  reloadFees: typeof reloadFees
  sendDepositTx$: typeof sendDepositTx$
  approveERC20Token$: typeof approveERC20Token$
  isApprovedERC20Token$: typeof isApprovedERC20Token$
}

const initialContext: EthereumContextValue = {
  client$,
  clientViewState$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  fees$,
  reloadFees,
  sendDepositTx$,
  approveERC20Token$,
  isApprovedERC20Token$
}

const EthereumContext = createContext<EthereumContextValue | null>(null)

export const EthereumProvider: React.FC = ({ children }): JSX.Element => {
  return <EthereumContext.Provider value={initialContext}>{children}</EthereumContext.Provider>
}

export const useEthereumContext = () => {
  const context = useContext(EthereumContext)
  if (!context) {
    throw new Error('Context must be used within a EthereumProvider.')
  }
  return context
}
