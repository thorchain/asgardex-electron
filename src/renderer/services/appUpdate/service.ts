import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'

type AppUpdater = O.Option<string>

const { get$: appUpdater$, set: setAppUpdater } = observableState<AppUpdater>(O.none)

FP.pipe(
  Rx.from(window.apiAppUpdate),
  RxOp.catchError(() => Rx.EMPTY),
  RxOp.map((version) => O.some(version))
).subscribe(setAppUpdater)

const resetAppUpdater = () => setAppUpdater(O.none)

export { appUpdater$, resetAppUpdater }
