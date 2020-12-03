import { clientByChain$ } from './client'
import { isCrossChainDeposit$ } from './common'
import {
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  updateWithdrawFeesEffect$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } from './ledger'
import { asymDepositTxMemo$, symDepositTxMemo$ } from './memo'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export {
  clientByChain$,
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  reloadDepositFeesEffect$,
  updateWithdrawFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress
}
