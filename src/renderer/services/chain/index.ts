import { clientByChain$ } from './client'
import { isCrossChainDeposit$ } from './common'
import {
  reloadDepositFees,
  depositFees$,
  withdrawFees$,
  reloadWithdrawFees,
  updateDepositFeesEffect$,
  updateWithdrawFeesEffect$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress } from './ledger'
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
  updateDepositFeesEffect$,
  updateWithdrawFeesEffect$,
  isCrossChainDeposit$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress
}
