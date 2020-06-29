import * as Rx from 'rxjs'
import { startWith, mapTo } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { OnlineStatus } from './types'
import { Network } from './types'

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = Rx.fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = Rx.fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = Rx.merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

/**
 * State of `Network`
 */
const { get$: network$, set: changeNetwork } = observableState(Network.TEST)

export { onlineStatus$, network$, changeNetwork }
