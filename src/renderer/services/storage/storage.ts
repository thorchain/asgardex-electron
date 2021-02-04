import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { observableState } from '../../helpers/stateHelper'
import { INITIAL_STORAGE_STATE } from './const'
import { StoragePartialStateState, StorageState } from './types'

const { get$: getStorageState$, get: getStorageState, set: setStorageState } = observableState<StorageState>(
  INITIAL_STORAGE_STATE
)

export const removeStorage = async () => {
  await window.commonStorage.remove()
  setStorageState(O.none)
}

const modifyStorage = (partialData: StoragePartialStateState) => {
  FP.pipe(
    partialData,
    O.map((partialData) => window.commonStorage.save(partialData).then((newData) => setStorageState(O.some(newData))))
  )
}

// Run at the start of application
window.commonStorage.get().then(
  (result) => setStorageState(O.some(result)),
  (_) => setStorageState(O.none /* any error while parsing JSON file*/)
)

export { getStorageState$, modifyStorage, getStorageState }
