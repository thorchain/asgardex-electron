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
  RxOp.distinctUntilChanged(eqOAsset.equals)
)

const selectedPoolChain$: Observable<SelectedPoolChain> = selectedPoolAsset$.pipe(RxOp.map(O.map(({ chain }) => chain)))

export { selectedPoolAsset$, setSelectedPoolAsset, selectedPoolChain$ }
