import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { sequenceTOptionFromArray, sequenceTRDFromArray } from './fpHelpers'

describe('helpers/envHelper/', () => {
  describe('sequenceTOptionFromArray', () => {
    it('returns none for a list with none inside', () => {
      const result = FP.pipe([O.none, O.some(1)], sequenceTOptionFromArray)
      expect(result).toBeNone()
    })

    it('Lifts all "some" values', () => {
      const result = FP.pipe([O.some(1), O.some(2)], sequenceTOptionFromArray)
      expect(result).toEqual(O.some([1, 2]))
    })
  })

  describe('sequenceTRDFromArray', () => {
    it('returns `failure` for a RD list with failures inside', () => {
      const result = FP.pipe([RD.failure('another error'), RD.success(1)], sequenceTRDFromArray)
      expect(result).toEqual(RD.failure('another error'))
    })

    it('returns `pending` for a RD list with `pending` inside', () => {
      const result = FP.pipe([RD.success(1), RD.pending], sequenceTRDFromArray)
      expect(result).toEqual(RD.pending)
    })

    it('returns `pending` for a RD list with `pending` inside', () => {
      const progress = { loaded: 100, total: O.none }
      const result = FP.pipe([RD.success(1), RD.progress(progress)], sequenceTRDFromArray)
      expect(result).toEqual(RD.progress(progress))
    })

    it('Lifts all `success` values', () => {
      const result = FP.pipe([RD.success(1), RD.success(2)], sequenceTRDFromArray)
      expect(result).toEqual(RD.success([1, 2]))
    })
  })
})
