import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useWalletContext } from '../contexts/WalletContext'
import { INITIAL_KEYSTORE_STATE } from '../services/wallet/const'
import {
  KeystoreState,
  Phrase,
  RemoveKeystoreWalletHandler,
  ChangeKeystoreWalletHandler,
  RenameKeystoreWalletHandler
} from '../services/wallet/types'
import { getPhrase, getWalletName, isLocked } from '../services/wallet/util'

export const useKeystoreState = (): {
  state: KeystoreState
  phrase: O.Option<Phrase>
  walletName: O.Option<string>
  remove: RemoveKeystoreWalletHandler
  change$: ChangeKeystoreWalletHandler
  rename$: RenameKeystoreWalletHandler
  unlock: (password: string) => Promise<void>
  lock: FP.Lazy<void>
  locked: boolean
} => {
  const {
    keystoreService: {
      keystore$,
      unlock,
      lock,
      removeKeystoreWallet: remove,
      changeKeystoreWallet: change$,
      renameKeystoreWallet: rename$
    }
  } = useWalletContext()

  const state = useObservableState(keystore$, INITIAL_KEYSTORE_STATE)

  const [phrase] = useObservableState(() => FP.pipe(keystore$, RxOp.map(FP.flow(getPhrase))), O.none)
  const [walletName] = useObservableState(() => FP.pipe(keystore$, RxOp.map(FP.flow(getWalletName))), O.none)
  const [locked] = useObservableState(() => FP.pipe(keystore$, RxOp.map(FP.flow(isLocked))), false)

  return { state, phrase, walletName, unlock, lock, locked, remove, change$, rename$ }
}
