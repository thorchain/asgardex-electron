import { getAssetFromString, Asset } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { unsafeAssetToString, assetToString } from './assetHelper'

describe('assetHelper', () => {
  describe('assetToString', () => {
    it('returns RUNE', () => {
      const assetString = 'BNB.RUNE-A1A'
      const asset = getAssetFromString(assetString)
      expect(assetToString(asset)).toEqual(O.some(assetString))
    })
    it('returns none if symbol is missing', () => {
      const asset: Asset = { chain: 'BNB' }
      expect(assetToString(asset)).toBeNone()
    })
    it('returns none if symbol is missing', () => {
      const asset: Asset = {}
      expect(assetToString(asset)).toBeNone()
    })
  })
  describe('unsafeAssetToString', () => {
    it('returns RUNE', () => {
      const assetString = 'BNB.RUNE-A1A'
      const asset = getAssetFromString(assetString)
      expect(unsafeAssetToString(asset)).toEqual(assetString)
    })
  })
})
