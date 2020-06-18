import { Option } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

export type Phrase = string

export type PhraseService = {
  add: (phrase: Phrase, password: string) => void
  remove: () => void
  current$: Rx.Observable<Option<Phrase>>
}
