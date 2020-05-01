import { fromEvent, merge, Observable } from 'rxjs'
import { startWith, mapTo } from 'rxjs/operators'
import React, { createContext, useContext } from 'react'

export enum OnlineStatus {
  ON,
  OFF
}

// Check online status
// https://www.electronjs.org/docs/tutorial/online-offline-events

const online$ = fromEvent(window, 'online').pipe(mapTo(OnlineStatus.ON))
const offline$ = fromEvent(window, 'offline').pipe(mapTo(OnlineStatus.OFF))
const onlineStatus$ = merge(online$, offline$).pipe(startWith(navigator.onLine ? OnlineStatus.ON : OnlineStatus.OFF))

const connectionContext = createContext<Observable<OnlineStatus> | null>(null)

type Props = {
  children: React.ReactNode
}

export const ConnectionProvider: React.FC<Props> = ({ children }: Props): JSX.Element => (
  <connectionContext.Provider value={onlineStatus$}>{children}</connectionContext.Provider>
)

export const useConnection = () => {
  const context = useContext(connectionContext)
  if (!context) {
    throw new Error('context must be used within a ConnectionProvider.')
  }
  return context
}
