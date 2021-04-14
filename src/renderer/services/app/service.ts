import * as Client from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'
import { startWith, mapTo, distinctUntilChanged } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { getClientNetwork } from '../clients'
import { DEFAULT_NETWORK } from '../const'
import { OnlineStatus } from './types'

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = Rx.fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = Rx.fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = Rx.merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

/**
 * State of `Network`
 */
const { get$: getNetwork$, set: changeNetwork, get: getCurrentNetworkState } = observableState<Network>(DEFAULT_NETWORK)

// Since `network$` based on `observableState` and it takes an initial value,
// it might emit same values, we don't interested in.
// So we do need a simple "dirty check" to provide "real" changes of selected network
const network$: Rx.Observable<Network> = getNetwork$.pipe(distinctUntilChanged())

const clientNetwork$: Rx.Observable<Client.Network> = network$.pipe(RxOp.map(getClientNetwork))

export { onlineStatus$, network$, changeNetwork, getCurrentNetworkState, clientNetwork$ }
