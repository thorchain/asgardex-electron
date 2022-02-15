import * as RD from '@devexperts/remote-data-ts'
import { FeeOption } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/lib/Option'

import {
  AsymDepositState,
  SwapState,
  SymDepositState,
  WithdrawState,
  UpgradeRuneTxState,
  SendTxState,
  TxTypes,
  SymDepositAddresses
} from './types'

export const MAX_SWAP_STEPS = 3

/**
 * Default `FeeOption`s for chain txs
 */
export const ChainTxFeeOption: { [key in TxTypes]: FeeOption } = {
  SWAP: FeeOption.Fast,
  DEPOSIT: FeeOption.Fast,
  WITHDRAW: FeeOption.Fast,
  UPGRADE: FeeOption.Fast
}

export const INITIAL_SWAP_STATE: SwapState = {
  step: 1,
  swapTx: RD.initial,
  stepsTotal: MAX_SWAP_STEPS,
  swap: RD.initial
}

export const INITIAL_ASYM_DEPOSIT_STATE: AsymDepositState = {
  step: 1,
  depositTx: RD.initial,
  stepsTotal: 3,
  deposit: RD.initial
}

export const INITIAL_SYM_DEPOSIT_STATE: SymDepositState = {
  step: 1,
  stepsTotal: 4,
  depositTxs: { rune: RD.initial, asset: RD.initial },
  deposit: RD.initial
}

export const INITIAL_WITHDRAW_STATE: WithdrawState = {
  step: 1,
  stepsTotal: 3,
  withdrawTx: RD.initial,
  withdraw: RD.initial
}

export const INITIAL_UPGRADE_RUNE_STATE: UpgradeRuneTxState = {
  steps: { current: 0, total: 3 },
  status: RD.initial
}

export const INITIAL_SEND_STATE: SendTxState = {
  steps: { current: 0, total: 1 },
  status: RD.initial
}

export const INITIAL_SYM_DEPOSIT_ADDRESSES: SymDepositAddresses = {
  asset: O.none,
  rune: O.none
}
