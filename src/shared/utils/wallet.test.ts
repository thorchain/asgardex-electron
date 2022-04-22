import * as NEA from 'fp-ts/lib/NonEmptyArray'

import { toDerivationPathArray } from './wallet'

describe.only('shared/utils/wallet', () => {
  describe('toDerivationPathArray', () => {
    it('success', () => {
      const result = toDerivationPathArray("44'/330'/0'/0/", 0)
      const expected = NEA.fromArray([44, 330, 0, 0, 0])
      expect(result).toEqual(expected)
    })
    it('failed: characters in path', () => {
      const result = toDerivationPathArray("44'/330'/a/b/", 0)
      expect(result).toBeNone()
    })

    it('failed: invalid length of given path', () => {
      const result = toDerivationPathArray("44'/330'", 0)
      expect(result).toBeNone()
    })
  })
})
