import { tap, map, withLatestFrom } from 'rxjs/operators'

import { network$, toggleNetwork, onlineStatus$ } from './service'
import { OnlineStatus } from './types'

describe('services/app/service/', () => {
  describe('network$', () => {
    it('returns testnet by default', () => {
      runObservable(({ expectObservable }) => {
        expectObservable(network$).toBe('a', { a: 'testnet' })
      })
    })

    it('returns mainnet by toggleNetwork() before', () => {
      runObservable(({ expectObservable }) => {
        toggleNetwork()
        expectObservable(network$).toBe('a', { a: 'mainnet' })
      })
    })

    it('calling toggleNetwork() four times changes network four times', () => {
      runObservable(({ cold, expectObservable }) => {
        const values = { a: 1, b: 'testnet', c: 'mainnet' }
        const toggle = '--a----a--a--a'
        const result = '--b----c--b--c'
        const result$ = cold(toggle, values).pipe(
          tap(() => toggleNetwork()),
          withLatestFrom(network$),
          map(([_, network]) => network)
        )
        expectObservable(result$).toBe(result, values)
      })
    })
  })

  describe('onlineStatus$', () => {
    it('changes status different times', () => {
      runObservable(({ cold, expectObservable }) => {
        const online = () => window.dispatchEvent(new Event('online'))
        const offline = () => window.dispatchEvent(new Event('offline'))

        const valuesToggle = { a: 'on', b: 'off' }
        const valuesResult = { c: OnlineStatus.ON, d: OnlineStatus.OFF }
        const toggle = '--a--b--a--b'
        const result = '--c--d--c--d'

        const changeOnlineStatus = (value: string) => {
          if (value === 'on') online()
          if (value === 'off') offline()
          return value
        }

        const result$ = cold(toggle, valuesToggle).pipe(
          map(changeOnlineStatus),
          withLatestFrom(onlineStatus$),
          map(([_, status]) => status)
        )
        expectObservable(result$).toBe(result, valuesResult)
      })
    })
  })
})
