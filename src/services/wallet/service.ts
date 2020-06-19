import * as path from 'path'

import { encryptToKeyStore, decryptFromKeystore, Keystore } from '@thorchain/asgardex-crypto'
import * as E from 'fp-ts/lib/Either'
import { Either, right, left } from 'fp-ts/lib/Either'
import { none, some, Option, isSome } from 'fp-ts/lib/Option'
import * as fs from 'fs-extra'
import { map } from 'rxjs/operators'

import { STORAGE_DIR } from '../../const'
import { observableState } from '../../helpers/stateHelper'
import { Phrase, PhraseService } from './types'

// Key file
const getKeyFilePath = async () => {
  const keyFilePath = path.join(STORAGE_DIR, 'key.json')
  await fs.ensureFile(keyFilePath)
  return keyFilePath
}

const { get$: getPhrase$, set: setPhrase } = observableState<Option<string>>(none)

const addPhrase = async (phrase: Phrase, password: string) => {
  try {
    const keystore: Keystore = await encryptToKeyStore(phrase, password)
    const keyfile = await getKeyFilePath()
    await fs.writeJSON(keyfile, keystore)
    setPhrase(some(phrase))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

const getPhrase = async (password: string) => {
  try {
    const keyfile = await getKeyFilePath()
    const keystore: Keystore = await fs.readJSON(keyfile)
    const phrase = await decryptFromKeystore(keystore, password)
    return some(phrase)
  } catch (_) {
    return none
  }
}

const removePhrase = async () => {
  const keyfile = await getKeyFilePath()
  await fs.remove(keyfile)
  setPhrase(none)
}

export const phrase: PhraseService = {
  add: addPhrase,
  remove: removePhrase,
  current$: getPhrase$
}

type Locked = boolean
type LockedE = Either<Error, Locked>
const { get$: locked$, set: setLocked } = observableState<LockedE>(right(false))

// re-export locked$
export { locked$ }

// helper stream to get unlock state
export const isLocked$ = locked$.pipe(
  map((valueE) =>
    E.fold(
      (_) => false, // error means it's still unlocked
      (value) => !!value // check value
    )(valueE)
  )
)

export const lock = () => {
  setPhrase(none)
  setLocked(right(true))
}

export const unlock = async (password: string) => {
  const phrase = await getPhrase(password)
  const locked = isSome(phrase) ? right(false) : left(new Error('Wrong password to unlock'))
  setLocked(locked)
  setPhrase(phrase)
}
