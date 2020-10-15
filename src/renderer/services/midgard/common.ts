import { Asset } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { distinctUntilChanged } from 'rxjs/operators'

import { eqOAsset } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'

/** Selected pool asset */
const { get$: getSelectedPoolAsset$, set: setSelectedPoolAsset } = observableState<O.Option<Asset>>(O.none)

// "dirty check" to trigger "real" changes of an asset only
const selectedPoolAsset$ = getSelectedPoolAsset$.pipe(distinctUntilChanged(eqOAsset.equals))

export { selectedPoolAsset$, setSelectedPoolAsset }
