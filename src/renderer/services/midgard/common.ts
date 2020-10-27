import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqOAsset } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { SelectedPoolAsset, SelectedPoolChain } from './types'

/** Selected pool asset */
const { get$: getSelectedPoolAsset$, set: setSelectedPoolAsset } = observableState<SelectedPoolAsset>(O.none)

// "dirty check" to trigger "real" changes of an asset only
const selectedPoolAsset$: Observable<SelectedPoolAsset> = getSelectedPoolAsset$.pipe(
  RxOp.distinctUntilChanged((a, b) => {
    const compare = eqOAsset.equals
    // debugger
    return compare(a, b)
  }),
  RxOp.tap((asset) => console.log('selected pool asset', asset)),
  RxOp.shareReplay(1)
)

const selectedPoolChain$: Observable<SelectedPoolChain> = selectedPoolAsset$.pipe(RxOp.map(O.map(({ chain }) => chain)))

export { selectedPoolAsset$, setSelectedPoolAsset, selectedPoolChain$ }
