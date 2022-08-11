import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'

import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreWalletsRD, KeystoreWalletsUI } from '../services/wallet/types'

export const useKeystoreWallets = (): {
  wallets: KeystoreWalletsRD
  reload: FP.Lazy<void>
  walletsUI: KeystoreWalletsUI
} => {
  const {
    keystoreService: { reloadKeystoreWallets: reload, keystoreWallets$, keystoreWalletsUI$ }
  } = useWalletContext()

  const wallets = useObservableState(keystoreWallets$, RD.initial)
  const walletsUI = useObservableState(keystoreWalletsUI$, [])

  return { wallets: wallets, walletsUI, reload }
}
