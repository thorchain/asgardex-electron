import * as Rx from 'rxjs'

import { Network, SlipTolerance } from '../../../shared/api/types'

export enum OnlineStatus {
  ON = 'online',
  OFF = 'offline'
}

export type ChangeNetworkHandler = (network: Network) => void

export type Network$ = Rx.Observable<Network>

export type ChangeSlipToleranceHandler = (slip: SlipTolerance) => void

export type SlipTolerance$ = Rx.Observable<SlipTolerance>
