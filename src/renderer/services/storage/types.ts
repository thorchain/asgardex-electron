import * as O from 'fp-ts/Option'

import { DEFAULT_STORAGES } from '../../../shared/const'

export type CommonStorageData = typeof DEFAULT_STORAGES['common']
export type NodesStorageData = typeof DEFAULT_STORAGES['userNodes']

export type StorageState<T> = O.Option<T>
export type StoragePartialState<T> = O.Option<Partial<T>>
