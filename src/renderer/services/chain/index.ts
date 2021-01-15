import { addressByChain$, assetAddress$ } from './address'
import { clientByChain$ } from './client'
import { getExplorerUrlByAsset$ } from './explorerUrl'
import {
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  reloadSwapFees,
  swapFees$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } from './ledger'
import { asymDepositTxMemo$, symDepositTxMemo$ } from './memo'
import { swap$, asymDeposit$ } from './transaction'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export {
  addressByChain$,
  clientByChain$,
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees,
  swapFees$,
  getExplorerUrlByAsset$,
  assetAddress$,
  swap$,
  asymDeposit$
}
