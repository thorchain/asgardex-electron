import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'

export enum OnlineStatus {
  ON = 'online',
  OFF = 'offline'
}

export type Network$ = Rx.Observable<Network>
