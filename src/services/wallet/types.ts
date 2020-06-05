import * as Rx from 'rxjs'

export type Phrase = string

export type PhraseService = {
  add: (p: Phrase) => void
  remove: () => void
  current$: Rx.Observable<Phrase>
}
