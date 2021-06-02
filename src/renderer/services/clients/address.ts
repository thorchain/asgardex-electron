import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { removeAddressPrefix } from '../../helpers/addressHelper'
import { eqOString } from '../../helpers/fp/eq'
import { Address$, XChainClient$ } from '../clients/types'

export const addressUI$: (client$: XChainClient$) => Address$ = (client$) =>
  client$.pipe(
    RxOp.map(
      O.chain((client) =>
        O.tryCatch(() =>
          client.getAddress(
            /* TODO (@asgdx team) Check if we still can use `0` as default index in the future by introducing HD wallets */
            0
          )
        )
      )
    ),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const address$: (client$: XChainClient$) => Address$ = (client$) =>
  FP.pipe(addressUI$(client$), RxOp.map(O.map((address: Address) => removeAddressPrefix(address))))
