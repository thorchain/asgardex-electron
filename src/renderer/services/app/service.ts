import * as Rx from 'rxjs'
import { startWith, mapTo } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { DEFAULT_NETWORK } from '../const'
import { OnlineStatus, Network } from './types'

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = Rx.fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = Rx.fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = Rx.merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

/**
 * State of `Network`
 */
const { get$: network$, set: changeNetwork, get: getCurrentNetworkState } = observableState<Network>(DEFAULT_NETWORK)

export { onlineStatus$, network$, changeNetwork, getCurrentNetworkState }
