import { Address } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network, UserNodesStorage } from '../../../shared/api/types'
import { USER_NODES_STORAGE_DEFAULT } from '../../../shared/const'
import { eqString } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { StoragePartialState, StorageState } from './types'

const {
  get$: getStorageState$,
  get: getStorageState,
  set: setStorageState
} = observableState<StorageState<UserNodesStorage>>(O.none)

export const removeStorage = async () => {
  await window.apiUserNodesStorage.remove()
  setStorageState(O.none)
}

const modifyStorage = (oPartialData: StoragePartialState<UserNodesStorage>) => {
  FP.pipe(
    oPartialData,
    O.map((partialData) =>
      window.apiUserNodesStorage.save(partialData).then((newData) => setStorageState(O.some(newData)))
    )
  )
}

// Run at the start of application
window.apiUserNodesStorage.get().then(
  (result) => setStorageState(O.some(result)),
  (_) => setStorageState(O.none /* any error while parsing JSON file*/)
)

const userNodes$: Rx.Observable<Address[]> = FP.pipe(
  Rx.combineLatest([network$, getStorageState$]),
  RxOp.map(([network, storageState]) =>
    FP.pipe(
      storageState,
      O.map((userNodes) => userNodes[network]),
      O.getOrElse((): Address[] => [])
    )
  ),
  RxOp.shareReplay(1)
)

const addNodeAddress = (node: Address, network: Network) => {
  const savedNodes: UserNodesStorage = FP.pipe(
    getStorageState(),
    O.getOrElse(() => USER_NODES_STORAGE_DEFAULT)
  )

  FP.pipe(savedNodes[network], A.elem(eqString)(node), (isNodeExistsInSavedArray) => {
    if (!isNodeExistsInSavedArray) {
      modifyStorage(O.some({ ...savedNodes, [network]: [...savedNodes[network], node] }))
    }
  })
}

const removeNodeByAddress = (node: Address, network: Network) => {
  const savedNodes: UserNodesStorage = FP.pipe(
    getStorageState(),
    O.getOrElse(() => USER_NODES_STORAGE_DEFAULT)
  )

  FP.pipe(savedNodes[network], A.elem(eqString)(node), (isNodeExistsInSavedArray) => {
    // to avoid re-writing and re-firing to the initial stream
    if (isNodeExistsInSavedArray) {
      modifyStorage(
        O.some({
          ...savedNodes,
          [network]: FP.pipe(
            savedNodes[network],
            A.filter((savedNode) => savedNode !== node)
          )
        })
      )
    }
  })
}

export { userNodes$, addNodeAddress, removeNodeByAddress }
