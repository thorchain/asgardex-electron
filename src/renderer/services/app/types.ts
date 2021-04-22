import * as Rx from 'rxjs'

import { Network } from '../../../shared/api/types'

export enum OnlineStatus {
  ON,
  OFF
}

export type Network$ = Rx.Observable<Network>
