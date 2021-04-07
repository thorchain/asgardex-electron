import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'

import {
  AsymDepositState,
  SwapState,
  SymDepositState,
  WithdrawState,
  UpgradeRuneTxState,
  SendTxState,
  TxTypes
} from './types'

export const MAX_SWAP_STEPS = 3

/**
 * Default `FeeOptionKey`s for chain txs
 */
export const FeeOptionKeys: { [key in TxTypes]: FeeOptionKey } = {
  SWAP: 'fast',
  DEPOSIT: 'fast',
  WITHDRAW: 'fast',
  UPGRADE: 'fast'
}

export const SWAP_FEE_OPTION_KEY: FeeOptionKey = 'fast'

export const INITIAL_SWAP_STATE: SwapState = {
  step: 1,
  swapTx: RD.initial,
  stepsTotal: MAX_SWAP_STEPS,
  swap: RD.initial
}

export const DEPOSIT_FEE_OPTION_KEY: FeeOptionKey = 'fast'

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
  steps: { current: 0, total: 2 },
  status: RD.initial
}
