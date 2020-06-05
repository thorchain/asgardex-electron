import * as Rx from 'rxjs'

import { Phrase, PhraseService } from './types'

// Important note:
// As a temporary workaround, we store phrase into `local-storage` as plain text,
// but it has to be decrypted before. It will be done by another PR.
// See https://github.com/thorchain/asgardex-electron/issues/148

const PHRASE_KEY = 'asgdx-phrase'

const initialPhrase = localStorage.getItem(PHRASE_KEY) || ''

const phrase$$ = new Rx.BehaviorSubject(initialPhrase)

const addPhrase = (p: Phrase) => {
  localStorage.setItem(PHRASE_KEY, p)
  phrase$$.next(p)
}

const removePhrase = () => {
  localStorage.removeItem(PHRASE_KEY)
  phrase$$.next('')
}

export const phrase: PhraseService = {
  add: addPhrase,
  remove: removePhrase,
  current$: phrase$$.asObservable()
}
