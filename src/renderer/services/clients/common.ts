import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { ExplorerUrl$, GetExplorerAddressUrl$, GetExplorerTxUrl$, XChainClient$ } from './types'

export const explorerUrl$: <T = void>(client$: XChainClient$<T>) => ExplorerUrl$ = (client$) =>
  client$.pipe(
    RxOp.map(O.map((client) => client.getExplorerUrl())),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const getExplorerTxUrl$: <T = void>(client$: XChainClient$<T>) => GetExplorerTxUrl$ = (client$) =>
  client$.pipe(RxOp.map(O.map((client) => client.getExplorerTxUrl)), RxOp.shareReplay(1))

export const getExplorerAddressUrl$: <T = void>(client$: XChainClient$<T>) => GetExplorerAddressUrl$ = (client$) =>
  client$.pipe(RxOp.map(O.map((client) => client.getExplorerAddressUrl)), RxOp.shareReplay(1))
