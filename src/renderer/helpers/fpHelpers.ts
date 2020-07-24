import { sequenceT } from 'fp-ts/lib/Apply'
import * as O from 'fp-ts/lib/Option'

export const sequenceTOption = sequenceT(O.option)
