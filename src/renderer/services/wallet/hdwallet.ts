import { observableState } from '../../helpers/stateHelper'
import { INITIAL_HDWALLET_STATE } from './const'
import { HDWalletService, HDWalletInfo } from './types'

const { get$: getHDWalletState$, set: setHDWalletState } = observableState<HDWalletInfo>(INITIAL_HDWALLET_STATE)

const connectBTC = async () => {
  try {
    const bitcoinAddress = await window.apiHDWallet.getBTCAddress()
    setHDWalletState({ bitcoinAddress })
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
