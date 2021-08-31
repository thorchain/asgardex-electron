import * as Client from '@xchainjs/xchain-client'

import { LedgerErrorType } from '../../../../../../ledger-thorchain-js/lib'
import { LedgerErrorId, Network } from '../../../../shared/api/types'

// TODO(@Veado) Move `toClientNetwork` from `renderer/services/clients` to `main/util` or so
export const toClientNetwork = (network: Network): Client.Network =>
  network === 'mainnet' ? Client.Network.Mainnet : Client.Network.Testnet
// TODO(@veado) Get path by using `xchain-thorchain`
export const PATH = [44, 931, 0, 0, 0]

export const fromLedgerErrorType = (error: LedgerErrorType): LedgerErrorId => {
  switch (error) {
    case LedgerErrorType.DeviceIsBusy:
      return LedgerErrorId.ALREADY_IN_USE
    case LedgerErrorType.SignVerifyError:
      return LedgerErrorId.SIGN_FAILED
    case LedgerErrorType.AppDoesNotSeemToBeOpen:
      return LedgerErrorId.NO_APP
    default:
      return LedgerErrorId.UNKNOWN

    // NO_DEVICE,
    // ALREADY_IN_USE,
    // NO_APP,
    // WRONG_APP,
    // SIGN_FAILED,
    // DENIED,
    // UNKNOWN
  }
}
