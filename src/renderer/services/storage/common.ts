import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { CommonStorage } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { StoragePartialState, StorageState } from './types'

const {
  get$: getStorageState$,
  get: getStorageState,
  set: setStorageState
} = observableState<StorageState<CommonStorage>>(O.none)

const modifyStorage = (oPartialData: StoragePartialState<CommonStorage>) => {
  FP.pipe(
    oPartialData,
    O.map((partialData) =>
      window.apiCommonStorage.save(partialData).then((newData) => setStorageState(O.some(newData)))
    )
  )
}

// Run at the start of application
window.apiCommonStorage.get().then(
  (result) => setStorageState(O.some(result)),
  (_) => setStorageState(O.none /* any error while parsing JSON file*/)
)

export { getStorageState$, modifyStorage, getStorageState }
