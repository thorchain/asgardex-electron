import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'

type AppUpdater = O.Option<{
  nextRelease: string
  nextReleasePath: string
}>

const { get$: appUpdater$, set: setAppUpdater } = observableState<AppUpdater>(O.none)

FP.pipe(
  Rx.from(window.apiAppUpdate),
  RxOp.catchError(() => Rx.EMPTY),
  RxOp.map(({ version, url }) =>
    O.some({
      nextRelease: version,
      nextReleasePath: url
    })
  )
).subscribe(setAppUpdater)

const resetAppUpdater = () => setAppUpdater(O.none)

export { appUpdater$, resetAppUpdater }
