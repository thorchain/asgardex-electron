import { Option } from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'

export type Phrase = string

/**
 * Type for providing 3 states of keystore
 *
 * (1) `None` -> DEFAULT (keystore needs to be imported at start of application or after shutdown of app)
 * (2) `Some<None>` -> LOCKED STATUS (keystore file, but no phrase)
 * (3) `Some<Some<Phrase>>` -> UNLOCKED + IMPORTED STATUS (keystore file + phrase)
 */
// export type KeystoreState = Option<Option<Phrase>>
export type KeystoreState = Option<Option<Phrase>>

export type KeystoreService = {
  keystore$: Observable<KeystoreState>
  addKeystore: (phrase: Phrase, password: string) => Promise<void>
  removeKeystore: () => Promise<void>
  unlock: (state: KeystoreState, password: string) => Promise<void>
  lock: () => void
}
