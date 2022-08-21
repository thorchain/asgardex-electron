import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'

import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreWalletsRD, KeystoreWalletsUI } from '../services/wallet/types'

export const useKeystoreWallets = (): {
  walletsPersistentRD: KeystoreWalletsRD
  reload: FP.Lazy<void>
  walletsUI: KeystoreWalletsUI
} => {
  const {
    keystoreService: { reloadPersistentKeystoreWallets: reload, keystoreWalletsPersistent$, keystoreWalletsUI$ }
  } = useWalletContext()

  const walletsPersistentRD = useObservableState(keystoreWalletsPersistent$, RD.initial)
  const walletsUI = useObservableState(keystoreWalletsUI$, [])

  return { walletsPersistentRD, walletsUI, reload }
}
