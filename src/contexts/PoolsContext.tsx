import * as Rx from 'rxjs'
import { ajax, AjaxResponse } from 'rxjs/ajax'
import { retry, mergeMap, catchError, startWith } from 'rxjs/operators'
import React, { createContext, useContext } from 'react'
import * as RD from '@devexperts/remote-data-ts'
import byzantine from '@thorchain/byzantine-module'

export type PoolsRD = RD.RemoteData<Error, string[]>

const endpoint$ = Rx.from(byzantine()).pipe(retry(5))
export const pools$ = endpoint$
  .pipe(mergeMap((endpoint) => ajax(`${endpoint}/v1/pools`)))
  .pipe(retry(3))
  .pipe(mergeMap(({ response }: AjaxResponse) => Rx.of(RD.success(response as string[]))))
  .pipe(catchError((error: Error) => Rx.of(RD.failure(error))))
  .pipe(startWith(RD.pending))

type PoolsContextValue = typeof pools$

const PoolsContext = createContext<PoolsContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const PoolsProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <PoolsContext.Provider value={pools$}>{children}</PoolsContext.Provider>
)

export const usePoolsContext = () => {
  const context = useContext(PoolsContext)
  if (!context) {
    throw new Error('context must be used within a ConnectionProvider.')
  }
  return context
}
