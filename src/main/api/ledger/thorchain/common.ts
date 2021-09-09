import { LedgerErrorType } from '@thorchain/ledger-thorchain'

import { LedgerErrorId } from '../../../../shared/api/types'

// TODO(@veado) Get path by using `xchain-thorchain`
export const PATH = [44, 931, 0, 0, 0]

export const fromLedgerErrorType = (error: number): LedgerErrorId => {
  switch (error) {
    case LedgerErrorType.DeviceIsBusy:
      return LedgerErrorId.ALREADY_IN_USE
    case LedgerErrorType.SignVerifyError:
      return LedgerErrorId.SIGN_FAILED
    case LedgerErrorType.AppDoesNotSeemToBeOpen:
      return LedgerErrorId.NO_APP
    default:
      return LedgerErrorId.UNKNOWN
  }
}
