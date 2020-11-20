import { Client } from '@thorchain/asgardex-ethereum'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { ClientState } from '../clients/types'

export type Client$ = Rx.Observable<O.Option<Client>>

export type EthereumClientState = ClientState<Client>
