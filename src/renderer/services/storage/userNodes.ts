import { Address } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import { eqString } from 'fp-ts/Eq'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getStorageState$, getStorageState, modifyStorage } from './storage'

const userNodes$: Rx.Observable<Address[]> = FP.pipe(
  getStorageState$,
  RxOp.map(
    FP.flow(
      O.map(({ userNodes }) => userNodes),
      O.getOrElse((): Address[] => [])
    )
  ),
  RxOp.shareReplay(1)
)

const addNodeAddress = (node: Address) => {
  const savedNodes = FP.pipe(
    getStorageState(),
    O.map(({ userNodes }) => userNodes),
    O.getOrElse((): Address[] => [])
  )

  FP.pipe(savedNodes, A.elem(eqString)(node), (isNodeExistsInSavedArray) => {
    if (!isNodeExistsInSavedArray) {
      modifyStorage(O.some({ userNodes: [...savedNodes, node] }))
    }
  })
}

const removeNodeByAddress = (node: Address) => {
  const savedNodes = FP.pipe(
    getStorageState(),
    O.map(({ userNodes }) => userNodes),
    O.getOrElse((): Address[] => [])
  )

  FP.pipe(savedNodes, A.elem(eqString)(node), (isNodeExistsInSavedArray) => {
    // to avoid re-writing and re-firing to the initial stream
    if (isNodeExistsInSavedArray) {
      modifyStorage(
        O.some({
          userNodes: FP.pipe(
            savedNodes,
            A.filter((savedNode) => savedNode !== node)
          )
        })
      )
    }
  })
}

export { userNodes$, addNodeAddress, removeNodeByAddress }
