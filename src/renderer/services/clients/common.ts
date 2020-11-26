import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, XChainClient$ } from './types'

export const address$: <T extends XChainClient$<any>>(client$: T) => Address$ = (client$) =>
  client$.pipe(
    RxOp.map(FP.pipe(O.map((client) => client.getAddress()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const explorerUrl$: <T extends XChainClient$<any>>(client$: T) => ExplorerUrl$ = (client$) =>
  client$.pipe(
    RxOp.map(FP.pipe(O.map((client) => client.getExplorerUrl()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const getExplorerTxUrl$: <T extends XChainClient$<any>>(client$: T) => GetExplorerTxUrl$ = (client$) =>
  client$.pipe(RxOp.map(FP.pipe(O.map((client) => client.getExplorerTxUrl))), RxOp.shareReplay(1))
