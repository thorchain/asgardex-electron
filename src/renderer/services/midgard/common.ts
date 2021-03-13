import * as O from 'fp-ts/lib/Option'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqOAsset } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { SelectedPoolAsset, SelectedPoolChain } from './types'

/** State of selected pool asset */
const {
  /* private getter, to access its value use `selectedPoolAsset$` only */
  get$: _selectedPoolAsset$,
  set: setSelectedPoolAsset
} = observableState<SelectedPoolAsset>(O.none)

/**
 * Current selected pool asset to interact with
 * It's `None` if no pool is selected
 **/
const selectedPoolAsset$: Observable<SelectedPoolAsset> = _selectedPoolAsset$.pipe(
  // "dirty check" to trigger "real" changes of an asset only
  RxOp.distinctUntilChanged(eqOAsset.equals),
  RxOp.shareReplay(1)
)

const selectedPoolChain$: Observable<SelectedPoolChain> = selectedPoolAsset$.pipe(RxOp.map(O.map(({ chain }) => chain)))

export { selectedPoolAsset$, setSelectedPoolAsset, selectedPoolChain$ }
