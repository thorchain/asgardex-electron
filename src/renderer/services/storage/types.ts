import * as O from 'fp-ts/Option'

import { STORE_FILES_DEFAULTS } from '../../../shared/const'

export type StorageData = typeof STORE_FILES_DEFAULTS['commonStorage']

export type StorageState = O.Option<StorageData>
export type StoragePartialStateState = O.Option<Partial<StorageData>>
