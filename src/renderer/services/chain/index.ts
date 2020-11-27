import { clientByChain$ } from './client'
import { isCrossChainStake$ } from './common'
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
  reloadDepositFees as reloadStakeFees,
  depositFees$ as stakeFees$,
  withdrawFees$,
  reloadWithdrawFees,
  updateDepositFeesEffect$ as updateStakeFeesEffect$,
  updateWithdrawFeesEffect$,
  isCrossChainStake$,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress
}
