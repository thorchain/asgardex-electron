import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { Address$, XChainClient$ } from '../clients/types'

export const address$: (client$: XChainClient$) => Address$ = (client$) =>
  client$.pipe(
    RxOp.map(FP.pipe(O.map((client) => client.getAddress()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )
