import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { sequenceTOptionFromArray, sequenceTRDFromArray } from './fpHelpers'

describe('helpers/envHelper/', () => {
  describe('sequenceTOptionFromArray', () => {
    it('returns none for an empty list', () => {
      const result = FP.pipe([], sequenceTOptionFromArray, O.isNone)
      expect(result).toBeTruthy()
    })

    it('returns none for a list with none inside', () => {
      const result = FP.pipe([O.none, O.some(1)], sequenceTOptionFromArray, O.isNone)
      expect(result).toBeTruthy()
    })

    it('Lifts all "some" values', () => {
      const result = FP.pipe([O.some(1), O.some(2)], sequenceTOptionFromArray)
      expect(result).toEqual(O.some([1, 2]))
    })
  })

  describe('sequenceTRDFromArray', () => {
    it('returns `failure` for an empty list', () => {
      const errorCallback = () => new Error()
      const result = FP.pipe([], sequenceTRDFromArray<Error, string>(errorCallback), RD.isFailure)
      expect(result).toBeTruthy()
    })

    it('returns `failure` for a RD list with failures inside', () => {
      const errorCallback = () => new Error()
      const result = FP.pipe(
        [RD.failure(new Error()), RD.success(1)],
        sequenceTRDFromArray<Error, number>(errorCallback),
        RD.isFailure
      )
      expect(result).toBeTruthy()
    })

    it('returns `pending` for a RD list with `pending` inside', () => {
      const errorCallback = () => new Error()
      const result = FP.pipe([RD.success(1), RD.pending], sequenceTRDFromArray<Error, number>(errorCallback))
      expect(result).toEqual(RD.pending)
    })

    it('returns `pending` for a RD list with `pending` inside', () => {
      const errorCallback = () => new Error()
      const result = FP.pipe(
        [RD.success(1), RD.progress({ loaded: 100, total: O.none })],
        sequenceTRDFromArray<Error, number>(errorCallback),
        RD.isPending
      )
      expect(result).toBeTruthy()
    })

    it('Lifts all `success` values', () => {
      const errorCallback = () => new Error()
      const result = FP.pipe([RD.success(1), RD.success(2)], sequenceTRDFromArray<Error, number>(errorCallback))
      expect(result).toEqual(RD.success([1, 2]))
    })
  })
})
