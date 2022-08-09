import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'

import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreAccountsRD, KeystoreAccountsUI } from '../services/wallet/types'

export const useKeystoreAccounts = (): {
  keystoreAccounts: KeystoreAccountsRD
  reloadKeystoreAccounts: FP.Lazy<void>
  keystoreAccountsUI: KeystoreAccountsUI
} => {
  const {
    keystoreService: { reloadKeystoreAccounts, keystoreAccounts$, keystoreAccountsUI$ }
  } = useWalletContext()

  const keystoreAccounts = useObservableState(keystoreAccounts$, RD.initial)
  const keystoreAccountsUI = useObservableState(keystoreAccountsUI$, [])

  return { keystoreAccounts, keystoreAccountsUI, reloadKeystoreAccounts }
}
