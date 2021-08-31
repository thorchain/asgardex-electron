import { LedgerErrorId } from '../../../shared/api/types'

// TODO (@asgdx-team) Should we remove it? Any ledger implementation should include its own `fromLedgerErrorType` (see ledger/thorchain/common`)
// as an example.

export const getErrorId = (message: string): LedgerErrorId => {
  if (message.includes('NoDevice') || message.includes('0x6804')) {
    return LedgerErrorId.NO_DEVICE
  }
  if (message.includes('cannot open device')) {
    return LedgerErrorId.ALREADY_IN_USE
  }
  if (message.includes('Security not satisfied')) {
    return LedgerErrorId.NO_APP
  }
  if (message.includes('CLA_NOT_SUPPORTED') || message.includes('INS_NOT_SUPPORTED')) {
    return LedgerErrorId.WRONG_APP
  }
  if (message.includes('CONDITIONS_OF_USE_NOT_SATISFIED') || message.includes('no signers')) {
    return LedgerErrorId.DENIED
  }

  return LedgerErrorId.UNKNOWN
}
