import * as path from 'path'

import { encryptToKeyStore, decryptFromKeystore, Keystore } from '@thorchain/asgardex-crypto'
import { app } from 'electron'
import { none, some, Option } from 'fp-ts/lib/Option'
import * as fs from 'fs-extra'
import { map } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { Phrase, PhraseService } from './types'

const STORAGE_DIR = 'storage'

// Storage dir
// https://www.electronjs.org/docs/api/app#appgetpathname
export const KEY_FILE = path.join(app.getPath('userData'), STORAGE_DIR, 'key.txt')

const { get$: getPhrase$, set: setPhrase } = observableState<Option<string>>(none)

const addPhrase = async (p: Phrase, password: string) => {
  const keystore: Keystore = await encryptToKeyStore(p, password)
  await fs.writeJSON(KEY_FILE, keystore)
  setPhrase(some(p))
}

const _getPhrase = async (password: string) => {
  try {
    const keystore: Keystore = await fs.readJSON(KEY_FILE)
    const phrase = await decryptFromKeystore(keystore, password)
    return some(phrase)
  } catch (_) {
    return none
  }
}

const removePhrase = async () => {
  await fs.remove(KEY_FILE)
  setPhrase(none)
}

export const phrase: PhraseService = {
  add: addPhrase,
  remove: removePhrase,
  current$: getPhrase$
}

const { get$: locked$, set: setLocked } = observableState(false)

export const isLocked$ = locked$.pipe(map((value) => !!value))

export const lock = () => setLocked(true)
export const unlock = () => setLocked(false)
