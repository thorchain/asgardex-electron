import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'
import { distinctUntilChanged } from 'rxjs/operators'

import { eqOChain, eqOSelectedWalletAsset } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { getClientByChain$ } from '../chain/client'
import { SelectedWalletAsset } from './types'

const { get$: getSelectedAsset$, set: setSelectedAsset } = observableState<O.Option<SelectedWalletAsset>>(O.none)

// "dirty check" to trigger "real" changes of an asset only
const selectedAsset$ = getSelectedAsset$.pipe(distinctUntilChanged(eqOSelectedWalletAsset.equals))

/**
 * Selected chain depending on selected asset
 */
const selectedChain$ = selectedAsset$.pipe(
  RxOp.map(O.map(({ asset }) => asset.chain)),
  distinctUntilChanged(eqOChain.equals)
)

/**
 * Wallet client depends on selected chain
 */
const client$ = getClientByChain$(selectedChain$)

export { client$, selectedAsset$, setSelectedAsset, selectedChain$ }
