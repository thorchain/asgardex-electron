import * as O from 'fp-ts/lib/Option'

import { observableState } from '../../helpers/stateHelper'
import { INITIAL_HDWALLET_STATE } from './const'
import { HDWalletService, HDWalletState } from './types'

const { get$: getHDWalletState$, set: setHDWalletState } = observableState<HDWalletState>(INITIAL_HDWALLET_STATE)

const connectBTC = async () => {
  try {
    const bitcoinAddress = await window.apiHDWallet.getBTCAddress()
    setHDWalletState(O.some(O.some({ bitcoinAddress })))
    return Promise.resolve()
  } catch (error) {
    // TODO(@Veado) i18m
    return Promise.reject(`Could not get bitcoin address from ledger device: ${error}`)
  }
}

export const hdWalletService: HDWalletService = {
  info$: getHDWalletState$,
  connectBTC
}
