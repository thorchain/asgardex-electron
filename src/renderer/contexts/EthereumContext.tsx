import React, { createContext, useContext } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { DEFAULT_ETH_DERIVATION_MODE } from '../../shared/ethereum/const'
import { EthDerivationMode } from '../../shared/ethereum/types'
import {
  client$,
  clientState$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  addressUI$,
  explorerUrl$,
  fees$,
  reloadFees,
  sendPoolTx$,
  approveERC20Token$,
  isApprovedERC20Token$,
  approveFee$,
  reloadApproveFee
} from '../services/ethereum'
import { getStorageState$, modifyStorage } from '../services/storage/common'

export type EthereumContextValue = {
  client$: typeof client$
  clientState$: typeof clientState$
  txs$: typeof txs$
  resetTx: typeof resetTx
  subscribeTx: typeof subscribeTx
  sendTx: typeof sendTx
  txRD$: typeof txRD$
  address$: typeof address$
  addressUI$: typeof addressUI$
  explorerUrl$: typeof explorerUrl$
  fees$: typeof fees$
  reloadFees: typeof reloadFees
  sendPoolTx$: typeof sendPoolTx$
  approveERC20Token$: typeof approveERC20Token$
  isApprovedERC20Token$: typeof isApprovedERC20Token$
  approveFee$: typeof approveFee$
  reloadApproveFee: typeof reloadApproveFee
  ethDerivationMode$: Rx.Observable<EthDerivationMode>
  updateEthDerivationMode: (m: EthDerivationMode) => void
}

export const ethDerivationMode$ = FP.pipe(
  getStorageState$,
  RxOp.map(
    FP.flow(
      O.map(({ ethDerivationMode }) => ethDerivationMode),
      O.getOrElse(() => DEFAULT_ETH_DERIVATION_MODE)
    )
  ),
  RxOp.distinctUntilChanged()
)

export const updateEthDerivationMode = (mode: EthDerivationMode) => {
  modifyStorage(O.some({ ethDerivationMode: mode }))
}

const initialContext: EthereumContextValue = {
  client$,
  clientState$,
  txs$,
  resetTx,
  subscribeTx,
  sendTx,
  txRD$,
  address$,
  addressUI$,
  explorerUrl$,
  fees$,
  reloadFees,
  sendPoolTx$,
  approveERC20Token$,
  isApprovedERC20Token$,
  approveFee$,
  reloadApproveFee,
  ethDerivationMode$,
  updateEthDerivationMode
}

const EthereumContext = createContext<EthereumContextValue | null>(null)

export const EthereumProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  return <EthereumContext.Provider value={initialContext}>{children}</EthereumContext.Provider>
}

export const useEthereumContext = () => {
  const context = useContext(EthereumContext)
  if (!context) {
    throw new Error('Context must be used within a EthereumProvider.')
  }
  return context
}
