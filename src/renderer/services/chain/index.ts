import { addressByChain$, assetAddress$ } from './address'
import { clientByChain$ } from './client'
import { assetWithDecimal$ } from './decimal'
import {
  reloadSymDepositFees,
  symDepositFees$,
  reloadAsymDepositFee,
  asymDepositFee$,
  symWithdrawFee$,
  reloadWithdrawFees,
  reloadSwapFees,
  swapFees$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } from './ledger'
import { asymDepositTxMemo$, symDepositTxMemo$, getWithdrawMemo$ } from './memo'
import {
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeRuneToNative$,
  symWithdraw$,
  asymWithdraw$,
  transfer$
} from './transaction'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export {
  addressByChain$,
  clientByChain$,
  reloadSymDepositFees,
  symDepositFees$,
  reloadAsymDepositFee,
  asymDepositFee$,
  symWithdrawFee$,
  reloadWithdrawFees,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  getWithdrawMemo$,
  retrieveLedgerAddress,
  removeLedgerAddress,
  removeAllLedgerAddress,
  reloadSwapFees,
  swapFees$,
  assetAddress$,
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeRuneToNative$,
  symWithdraw$,
  asymWithdraw$,
  transfer$,
  assetWithDecimal$
}
