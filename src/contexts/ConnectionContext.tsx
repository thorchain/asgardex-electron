import React, { createContext, useContext } from 'react'

import * as Rx from 'rxjs'
import { startWith, mapTo } from 'rxjs/operators'

export enum OnlineStatus {
  ON,
  OFF
}

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = Rx.fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = Rx.fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = Rx.merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

const ConnectionContext = createContext<Rx.Observable<OnlineStatus>>(onlineStatus$)

type Props = {
  children: React.ReactNode
}

export const ConnectionProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <ConnectionContext.Provider value={onlineStatus$}>{children}</ConnectionContext.Provider>
)

export const useConnectionContext = () => useContext(ConnectionContext)
