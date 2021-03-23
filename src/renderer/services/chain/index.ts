import { addressByChain$, assetAddress$ } from './address'
import { clientByChain$ } from './client'
import { assetWithDecimal$ } from './decimal'
import { getExplorerUrlByAsset$, getExplorerAddressByChain$ } from './explorerUrl'
import {
  reloadSymDepositFees,
  symDepositFees$,
  reloadAsymDepositFee,
  asymDepositFee$,
  withdrawFee$,
  reloadWithdrawFee,
  reloadSwapFees,
  swapFees$
} from './fees'
import { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress } from './ledger'
import { asymDepositTxMemo$, symDepositTxMemo$, getWithdrawMemo$ } from './memo'
import {
  swap$,
  asymDeposit$,
  symDeposit$,
  upgradeBnbRune$,
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
  withdrawFee$,
  reloadWithdrawFee,
  symDepositTxMemo$,
  asymDepositTxMemo$,
  getWithdrawMemo$,
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
  symWithdraw$,
  asymWithdraw$,
  transfer$,
  assetWithDecimal$
}
