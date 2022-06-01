import * as O from 'fp-ts/Option'

export type StorageState<T> = O.Option<T>
export type StoragePartialState<T> = O.Option<Partial<T>>
