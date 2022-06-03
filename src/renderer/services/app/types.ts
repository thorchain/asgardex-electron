import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'
import { SlipTolerance } from '../../types/asgardex'

export enum OnlineStatus {
  ON = 'online',
  OFF = 'offline'
}

export type ChangeNetworkHandler = (network: Network) => void
export type Network$ = Rx.Observable<Network>

export type ChangeSlipToleranceHandler = (slip: SlipTolerance) => void
export type SlipTolerance$ = Rx.Observable<SlipTolerance>

export type SettingType = 'app' | 'wallet'
export type CollapsableSettings = Record<SettingType, boolean>
export type ToggleCollapsableSetting = (setting: SettingType) => void
