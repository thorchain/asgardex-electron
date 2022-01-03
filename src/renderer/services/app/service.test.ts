import { map, withLatestFrom } from 'rxjs/operators'

import { envOrDefault } from '../../../shared/utils/env'
import { runObservable } from '../../../test/util'
import { network$, changeNetwork, onlineStatus$ } from './service'
import { OnlineStatus } from './types'

describe('services/app/service/', () => {
  describe('network$', () => {
    it('gets default network from env', () => {
      runObservable(({ expectObservable }) => {
        expectObservable(network$).toBe('a', { a: envOrDefault(import.meta.env.REACT_APP_DEFAULT_NETWORK, 'mainnet') })
      })
    })

    it('returns testnet ', () => {
      runObservable(({ expectObservable }) => {
        changeNetwork('testnet')
        expectObservable(network$).toBe('a', { a: 'testnet' })
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
