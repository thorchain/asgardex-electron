import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { ExplorerUrl$, XChainClient$ } from './types'

export const explorerUrl$: (client$: XChainClient$) => ExplorerUrl$ = (client$) =>
  client$.pipe(
    RxOp.map(O.map((client) => client.getExplorerUrl())),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )
