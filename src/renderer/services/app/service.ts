import * as Client from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'
import { startWith, mapTo, distinctUntilChanged } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { toClientNetwork } from '../../../shared/utils/client'
import { observableState } from '../../helpers/stateHelper'
import { SlipTolerance } from '../../types/asgardex'
import { DEFAULT_NETWORK, DEFAULT_SLIP_TOLERANCE } from '../const'
import {
  Network$,
  SlipTolerance$,
  OnlineStatus,
  CollapsableSettings,
  SettingType,
  ToggleCollapsableSetting
} from './types'

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
const network$: Network$ = getNetwork$.pipe(distinctUntilChanged())

const clientNetwork$: Rx.Observable<Client.Network> = network$.pipe(RxOp.map(toClientNetwork))

/**
 * State of `Slip` tolerance
 */
const { get$: getSlipTolerance$, set: changeSlipTolerance } = observableState<SlipTolerance>(DEFAULT_SLIP_TOLERANCE)
const slipTolerance$: SlipTolerance$ = getSlipTolerance$.pipe(distinctUntilChanged())

/**
 * State of `collapsed` settings
 */
const {
  get$: collapsedSettings$,
  set: _setCollapsedSettings,
  get: getCollapsedSettings
} = observableState<CollapsableSettings>({
  wallet: false, // not collapsed === open by default
  app: false // not collapsed === open by default
})

const toggleCollapsedSetting: ToggleCollapsableSetting = (setting: SettingType) => {
  const currentSettings = getCollapsedSettings()
  const currentValue = currentSettings[setting]
  _setCollapsedSettings({ ...currentSettings, [setting]: !currentValue })
}

export {
  onlineStatus$,
  network$,
  changeNetwork,
  getCurrentNetworkState,
  clientNetwork$,
  slipTolerance$,
  changeSlipTolerance,
  collapsedSettings$,
  toggleCollapsedSetting
}
