import { Client } from '@xchainjs/xchain-thorchain'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { ClientState } from '../clients'

export type Client$ = Rx.Observable<O.Option<Client>>

export type ThorchainClientState = ClientState<Client>
export type ThorchainClientState$ = Rx.Observable<ClientState<Client>>
