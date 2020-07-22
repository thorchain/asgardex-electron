import { cold } from 'jest-marbles'
import { tap, map, withLatestFrom } from 'rxjs/operators'

import { network$, toggleNetwork } from './service'
import { Network } from './types'

describe('services/app/service/', () => {
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

    it('calling toggleNetwork() four times changes network four times', () => {
      const values = { a: 1, b: Network.TEST, c: Network.MAIN }
      const toggle = '--a----a--a--a'
      const result = '--b----c--b--c'

      const expected = cold(result, values)
      const result$ = cold(toggle, values).pipe(
        tap(() => toggleNetwork()),
        withLatestFrom(network$),
        map(([_, network]) => network)
      )
      expect(result$).toBeObservable(expected)
    })
  })
})
