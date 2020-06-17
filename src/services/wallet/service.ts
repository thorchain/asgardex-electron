import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { map } from 'rxjs/operators'

import { Phrase, PhraseService } from './types'

// Important note:
// As a temporary workaround, we store phrase into `local-storage` as plain text,
// but it has to be decrypted before. It will be done by another PR.
// See https://github.com/thorchain/asgardex-electron/issues/148

const PHRASE_KEY = 'asgdx-phrase'

const initialPhrase = O.fromNullable(localStorage.getItem(PHRASE_KEY))

const phrase$$ = new Rx.BehaviorSubject<Option<Phrase>>(initialPhrase)

const addPhrase = (p: Phrase) => {
  localStorage.setItem(PHRASE_KEY, p)
  phrase$$.next(some(p))
}

const removePhrase = () => {
  localStorage.removeItem(PHRASE_KEY)
  phrase$$.next(none)
}

export const phrase: PhraseService = {
  add: addPhrase,
  remove: removePhrase,
  current$: phrase$$.asObservable()
}

const locked$$ = new Rx.BehaviorSubject(false)
const locked$ = locked$$.asObservable()

export const isLocked$ = locked$.pipe(map((value) => !!value))

export const lock = () => locked$$.next(true)
export const unlock = () => locked$$.next(false)
