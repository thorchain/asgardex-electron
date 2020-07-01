import { pipe, identity } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { isSome, none, Option } from 'fp-ts/lib/Option'

import { KeystoreState, KeystoreContent, Phrase } from './types'

export const getKeystoreContent = (state: KeystoreState): Option<KeystoreContent> =>
  pipe(
    state,
    O.fold(() => none, identity)
  )

export const getPhrase = (state: KeystoreState): Option<Phrase> =>
  pipe(
    getKeystoreContent(state),
    O.map(({ phrase }) => phrase)
  )

export const hasKeystoreContent = (state: KeystoreState): boolean => isSome(getKeystoreContent(state))

export const hasImportedKeystore = (state: KeystoreState): boolean => isSome(state)

export const isLocked = (state: KeystoreState): boolean => !hasImportedKeystore(state) || !hasKeystoreContent(state)
