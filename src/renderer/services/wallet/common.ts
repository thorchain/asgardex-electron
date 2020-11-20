import { Asset } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'
import { distinctUntilChanged } from 'rxjs/operators'

import { eqOAsset, eqOChain } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { getClientByChain$ } from '../chain/client'

const { get$: getSelectedAsset$, set: setSelectedAsset } = observableState<O.Option<Asset>>(O.none)

// "dirty check" to trigger "real" changes of an asset only
const selectedAsset$ = getSelectedAsset$.pipe(distinctUntilChanged(eqOAsset.equals))

/**
 * Selected chain depending on selected asset
 */
const selectedChain$ = selectedAsset$.pipe(RxOp.map(O.map(({ chain }) => chain)), distinctUntilChanged(eqOChain.equals))

/**
 * Wallet client depends on selected chain
 */
const client$ = getClientByChain$(selectedChain$)

export { client$, selectedAsset$, setSelectedAsset, selectedChain$ }
