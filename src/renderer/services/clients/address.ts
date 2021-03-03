import { Address } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import * as RxOp from 'rxjs/operators'

import { removeAddressPrefix } from '../../helpers/addressHelper'
import { eqOString } from '../../helpers/fp/eq'
import { Address$, XChainClient$ } from '../clients/types'

export const addressUI$: (client$: XChainClient$) => Address$ = (client$) =>
  client$.pipe(
    RxOp.map(O.chain((client) => O.tryCatch(() => client.getAddress()))),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const address$: (client$: XChainClient$) => Address$ = (client$) =>
  pipe(addressUI$(client$), RxOp.map(O.map((address: Address) => removeAddressPrefix(address))))
