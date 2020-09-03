import { map, withLatestFrom } from 'rxjs/operators'

import { network$, changeNetwork, onlineStatus$ } from './service'
import { OnlineStatus } from './types'

describe('services/app/service/', () => {
  describe('network$', () => {
    it('returns testnet by default', () => {
      runObservable(({ expectObservable }) => {
        expectObservable(network$).toBe('a', { a: 'testnet' })
      })
    })

    it('returns mainnet ', () => {
      runObservable(({ expectObservable }) => {
        changeNetwork('mainnet')
        expectObservable(network$).toBe('a', { a: 'mainnet' })
      })
    })

    it('returns chaosnet ', () => {
      runObservable(({ expectObservable }) => {
        changeNetwork('chaosnet')
        expectObservable(network$).toBe('a', { a: 'chaosnet' })
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
