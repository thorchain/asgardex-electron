import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { balanceByAsset } from './binanceHelper'

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
})
