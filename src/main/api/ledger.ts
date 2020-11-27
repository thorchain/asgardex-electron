import AppBtc from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import * as E from 'fp-ts/Either'

import { LedgerErrorId } from '../../shared/api/types'

export const getBTCAddress = async () => {
  try {
    const transport = await TransportNodeHid.open('')
    const appBtc = new AppBtc(transport)
    const info = await appBtc.getWalletPublicKey("44'/0'/0'/0/0")
    await transport.close()
    return E.right(info.bitcoinAddress)
  } catch (error) {
    if (error.message === 'NoDevice') {
      return E.left(LedgerErrorId.NO_DEVICE)
    }
    if (error.message.includes('cannot open device')) {
      return E.left(LedgerErrorId.ALREADY_IN_USE)
    }
    switch (error.statusText) {
      case 'SECURITY_STATUS_NOT_SATISFIED':
        return E.left(LedgerErrorId.NO_APP)
      case 'CLA_NOT_SUPPORTED':
        return E.left(LedgerErrorId.WRONG_APP)
      case 'INS_NOT_SUPPORTED':
        return E.left(LedgerErrorId.WRONG_APP)
      case 'CONDITIONS_OF_USE_NOT_SATISFIED':
        return E.left(LedgerErrorId.DENIED)
      default:
        return E.left(LedgerErrorId.UNKNOWN)
    }
  }
}
