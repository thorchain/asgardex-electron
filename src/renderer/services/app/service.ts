import * as Rx from 'rxjs'
import { startWith, mapTo } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { OnlineStatus, Network } from './types'

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = Rx.fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = Rx.fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = Rx.merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

/**
 * State of `Network`
 */
const { get$: network$, get: getNetwork, set: changeNetwork } = observableState<Network>('testnet')

const toggleNetwork = () => {
  const next = getNetwork() === 'mainnet' ? 'testnet' : 'mainnet'
  changeNetwork(next)
}

export { onlineStatus$, network$, toggleNetwork }
