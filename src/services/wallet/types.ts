import { Option } from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

export type Phrase = string

export type PhraseService = {
  add: (p: Phrase) => void
  remove: () => void
  current$: Rx.Observable<Option<Phrase>>
}
