import { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { AppUpdateRD } from '../../shared/api/types'
import { observableState } from '../helpers/stateHelper'

export const useAppUpdate = () => {
  const { get$: appUpdater$, set: setAppUpdater } = useMemo(() => observableState<AppUpdateRD>(RD.initial), [])
  const appUpdater = useObservableState(FP.pipe(appUpdater$, RxOp.shareReplay(1)), RD.initial)
  const resetAppUpdater = () => setAppUpdater(RD.initial)

  const checkForUpdates = useCallback(() => {
    FP.pipe(
      Rx.from(window.apiAppUpdate.checkForAppUpdates()),
      RxOp.catchError((e) => Rx.of(RD.failure(new Error(e.message)))),
      RxOp.startWith(RD.pending)
    ).subscribe(setAppUpdater)
  }, [setAppUpdater])

  return {
    appUpdater,
    resetAppUpdater,
    checkForUpdates
  }
}
