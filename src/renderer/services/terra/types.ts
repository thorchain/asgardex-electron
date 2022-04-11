import { Client, FeeParams } from '@xchainjs/xchain-terra'
import * as O from 'fp-ts/lib/Option'

import { FeesLD } from '../chain/types'
import * as C from '../clients'

export type Client$ = C.Client$<Client>

export type ClientState = C.ClientState<Client>
export type ClientState$ = C.ClientState$<Client>

export type FeesService = {
  reloadFees: (params: O.Option<FeeParams>) => void
  fees$: (params?: FeeParams) => FeesLD
}
