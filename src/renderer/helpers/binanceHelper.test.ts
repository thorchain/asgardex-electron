import { EMPTY_ASSET } from '@thorchain/asgardex-util'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { balanceByAsset, isMiniToken } from './binanceHelper'

describe('binanceHelper', () => {
  describe('amountByAsset', () => {
    const txRUNE = { free: '123', symbol: ASSETS_TESTNET.RUNE.symbol.toString() }
    const txBOLT = { free: '234', symbol: ASSETS_TESTNET.BOLT.symbol.toString() }
    const txBNB = { free: '456', symbol: ASSETS_TESTNET.BOLT.symbol.toString() }
    it('returns amount of RUNE', () => {
      const result = balanceByAsset([txRUNE, txBOLT, txBNB], ASSETS_TESTNET.RUNE)
      expect(result.amount().toNumber()).toEqual(123)
    })
    it('returns 0 for unknown asset', () => {
      const result = balanceByAsset([txRUNE, txBNB], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
    it('returns 0 for an empty list of assets', () => {
      const result = balanceByAsset([], ASSETS_TESTNET.FTM)
      expect(result.amount().toNumber()).toEqual(0)
    })
  })

  describe('isMiniToken', () => {
    it('is true`', () => {
      expect(isMiniToken({ symbol: 'MINIA-7A2M' })).toBeTruthy()
    })
    it('is false for RUNE asset', () => {
      expect(isMiniToken({ symbol: 'RUNE-B1A' })).toBeFalsy()
    })
    it('is false for BNB asset', () => {
      expect(isMiniToken({ symbol: 'BNB' })).toBeFalsy()
    })
    it('is false for EMTPY asset', () => {
      expect(isMiniToken(EMPTY_ASSET)).toBeFalsy()
    })
  })
})
