import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@thorchain/asgardex-bitcoin'
import { FeeOptions } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import * as Rx from 'rxjs'

import { ClientState } from '../types'

export type BitcoinClientState = ClientState<BitcoinClient>
export type BitcoinClientState$ = Rx.Observable<ClientState<BitcoinClient>>

export type TxRD = RD.RemoteData<Error, string>
export type FeesRD = RD.RemoteData<Error, FeeOptions>
