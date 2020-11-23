import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, XChainClient$ } from './types'

export const address$: (client$: XChainClient$) => Address$ = (client$) =>
  client$.pipe(
    RxOp.map(FP.pipe(O.map((client) => client.getAddress()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const explorerUrl$: (client$: XChainClient$) => ExplorerUrl$ = (client$) =>
  client$.pipe(
    RxOp.map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const getExplorerTxUrl$: (client$: XChainClient$) => GetExplorerTxUrl$ = (client$) =>
  client$.pipe(RxOp.map(FP.pipe(O.map((client) => client.getExplorerTxUrl))), RxOp.shareReplay(1))
