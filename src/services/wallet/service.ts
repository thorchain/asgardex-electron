import * as path from 'path'

import { encryptToKeyStore, decryptFromKeystore, Keystore } from '@thorchain/asgardex-crypto'
// import { Either, right, left } from 'fp-ts/lib/Either'
import { none, some, Option, isSome, isNone } from 'fp-ts/lib/Option'
import * as fs from 'fs-extra'
import * as Rx from 'rxjs'
import { shareReplay, exhaustMap, map, debounceTime } from 'rxjs/operators'

import { STORAGE_DIR } from '../../const'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Phrase, PhraseService } from './types'

// key file path
const KEY_FILE = path.join(STORAGE_DIR, 'key.json')

// Create empty key file if not exists
const getOrCreateKeyFile = async () => {
  await fs.ensureFile(KEY_FILE)
  return KEY_FILE
}

// `TriggerStream` to check existence of keystore file
const { stream$: checkKeyStoreFileExists$, trigger: checkKeyStoreFileExists } = triggerStream()

/**
 * State of existence of keystore file
 */
export const keyStoreFileExists$ = checkKeyStoreFileExists$.pipe(
  // start loading queue
  exhaustMap((_) => Rx.from(fs.pathExists(KEY_FILE))),
  // tap((value) => console.log('keyStoreFileExists$', value)),
  // cache it to avoid new check by every subscription
  shareReplay()
)

const { get$: getPhraseState$, set: setPhraseState } = observableState<Option<string>>(none)

const addPhrase = async (phrase: Phrase, password: string) => {
  try {
    const keystore: Keystore = await encryptToKeyStore(phrase, password)
    const keyfile = await getOrCreateKeyFile()
    await fs.writeJSON(keyfile, keystore)
    checkKeyStoreFileExists()
    setPhraseState(some(phrase))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

const getPhrase = async (password: string) => {
  // make sure file exists
  const exists = await fs.pathExists(KEY_FILE)
  if (!exists) {
    return none
  }
  // read phrase from keystore
  try {
    const keystore: Keystore = await fs.readJSON(KEY_FILE)
    const phrase = await decryptFromKeystore(keystore, password)
    return some(phrase)
  } catch (_) {
    return none
  }
}

const removePhrase = async () => {
  setPhraseState(none)
  checkKeyStoreFileExists()
}

export const removeKeystore = async () => {
  await fs.remove(KEY_FILE)
  await removePhrase()
}

export const phrase: PhraseService = {
  add: addPhrase,
  remove: removePhrase,
  current$: getPhraseState$
}

/**
 * Locked state
 *
 * If no keyfile is exist OR no phrase is available, the wallet is locked
 */
export const isLocked$ = Rx.combineLatest(getPhraseState$, keyStoreFileExists$).pipe(
  map(([phrase, exists]) => {
    const result = isNone(phrase) || !exists
    console.log('isLocked phrase:', phrase)
    console.log('isLocked exists:', exists)
    console.log('isLocked result:', result)
    return result
  }),
  debounceTime(100),
  shareReplay()
)

/**
 * Locks wallet by removing phrase from memory
 * Note: It does not remove keystore from filesystem!
 */
export const lock = () => {
  setPhraseState(none)
}

/**
 * Unlocks wallet by getting phrase from keystore
 */
export const unlock = async (password: string) => {
  const phrase = await getPhrase(password)
  console.log('unlock phrase:', phrase)
  if (isSome(phrase)) {
    setPhraseState(phrase)
  }
}
