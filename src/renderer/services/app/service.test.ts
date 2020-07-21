import { cold } from 'jest-marbles'
import { tap, map, withLatestFrom } from 'rxjs/operators'

import { network$, toggleNetwork } from './service'
import { Network } from './types'

describe('services/app/service/', () => {
  beforeEach(() => {})

  describe('network$', () => {
    it('returns testnet by default', () => {
      const expected = cold('a', { a: Network.TEST })
      expect(network$).toBeObservable(expected)
    })

    it('returns mainnet by toggleNetwork() before', () => {
      toggleNetwork()
      const expected = cold('a', { a: Network.MAIN })
      expect(network$).toBeObservable(expected)
    })

    it('toggleNetwork() changes network four times', () => {
      const toggle = '--a----a--a--a'
      const result = '--a----b--a--b'
      const toggle$ = cold(toggle, { a: 1 }).pipe(tap(() => toggleNetwork()))
      const result$ = toggle$.pipe(
        withLatestFrom(network$),
        map(([_, network]) => network)
      )
      const expected = cold(result, { a: Network.TEST, b: Network.MAIN })
      expect(result$).toBeObservable(expected)
    })
  })
})
