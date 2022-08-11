import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useWalletContext } from '../contexts/WalletContext'
import { INITIAL_KEYSTORE_STATE } from '../services/wallet/const'
import { KeystoreState, Phrase, RemoveKeystoreWalletHandler } from '../services/wallet/types'
import { getPhrase, getWalletName } from '../services/wallet/util'

export const useKeystoreState = (): {
  state: KeystoreState
  phrase: O.Option<Phrase>
  walletName: O.Option<string>
  remove: RemoveKeystoreWalletHandler
  unlock: (password: string) => Promise<void>
  lock: FP.Lazy<void>
} => {
  const {
    keystoreService: { keystore$, unlock, lock, removeKeystoreWallet: remove }
  } = useWalletContext()

  const state = useObservableState(keystore$, INITIAL_KEYSTORE_STATE)

  const [phrase] = useObservableState(() => FP.pipe(keystore$, RxOp.map(FP.flow(getPhrase))), O.none)
  const [walletName] = useObservableState(() => FP.pipe(keystore$, RxOp.map(FP.flow(getWalletName))), O.none)

  return { state, phrase, walletName, unlock, lock, remove }
}
