import * as Rx from 'rxjs'

import { Maybe } from '../../types/asgardex'

export type Phrase = string

export type PhraseService = {
  add: (p: Phrase) => void
  remove: () => void
  current$: Rx.Observable<Maybe<Phrase>>
}
