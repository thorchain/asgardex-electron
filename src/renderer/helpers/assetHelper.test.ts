import { assetFromString, EMPTY_ASSET } from '@thorchain/asgardex-util'

import { isRuneAsset } from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('isRuneAsset', () => {
    it('checks rune asset for testnet', () => {
      const asset = assetFromString('BNB.RUNE-B1A') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeTruthy()
    })

    it('checks rune asset (mainnet)', () => {
      const asset = assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      const asset = assetFromString('BNB.BNB') || EMPTY_ASSET
      expect(isRuneAsset(asset)).toBeFalsy()
    })
  })
})
