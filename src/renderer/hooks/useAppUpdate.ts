import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { AppUpdateRD } from '../../shared/api/types'
import { observableState } from '../helpers/stateHelper'

const { get$: appUpdater$, set: setAppUpdater } = observableState<AppUpdateRD>(RD.initial)

const ONE_HOUR_PERIOD = 1000 * 60 * 60

FP.pipe(
  Rx.timer(0, 6 * ONE_HOUR_PERIOD),
  RxOp.switchMap(() => Rx.from(window.apiAppUpdate.checkForAppUpdates())),
  RxOp.catchError((e) => Rx.of(RD.failure(new Error(e.message))))
).subscribe(setAppUpdater)

const resetAppUpdater = () => setAppUpdater(RD.initial)

export const useAppUpdate = () => {
  const appUpdater = useObservableState(FP.pipe(appUpdater$, RxOp.shareReplay(1)), RD.initial)
  return {
    appUpdater,
    resetAppUpdater
  }
}
