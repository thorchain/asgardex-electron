import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'

import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreAccountsRD, KeystoreAccountsUI } from '../services/wallet/types'

export const useKeystoreAccounts = (): {
  accounts: KeystoreAccountsRD
  reload: FP.Lazy<void>
  accountsUI: KeystoreAccountsUI
} => {
  const {
    keystoreService: { reloadKeystoreAccounts: reload, keystoreAccounts$, keystoreAccountsUI$ }
  } = useWalletContext()

  const accounts = useObservableState(keystoreAccounts$, RD.initial)
  const accountsUI = useObservableState(keystoreAccountsUI$, [])

  return { accounts, accountsUI, reload }
}
