import { Balance, BNBChain } from '@xchainjs/xchain-binance'
import { Asset, assetToBase, assetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { bncSymbolToAsset, bncSymbolToAssetString, getWalletBalances } from './utils'

describe('services/binance/utils/', () => {
  describe('bncSymbolToAssetString', () => {
    it('creates a RUNE `Asset` as string', () => {
      const result = bncSymbolToAssetString('RUNE-B1A')
      expect(result).toEqual('BNB.RUNE-B1A')
    })
  })

  describe('bncSymbolToAsset', () => {
    it('creates a RUNE `Asset`', () => {
      const result = FP.pipe(
        bncSymbolToAsset('RUNE-B1A'),
        O.getOrElse(() => ({ chain: BNBChain, symbol: 'invalid', ticker: 'invalid' } as Asset))
      )
      expect(result).toEqual({
        chain: BNBChain,
        symbol: 'RUNE-B1A',
        ticker: 'RUNE',
        synth: false
      })
    })
  })

  describe('getWalletBalances', () => {
    it('maps `BinanceBalances` -> `Balances`', () => {
      const balances: Balance[] = [
        {
          free: '1',
          symbol: 'BNB',
          locked: '',
          frozen: '11'
        },
        {
          free: '2',
          symbol: 'RUNE-B1A',
          locked: '',
          frozen: ''
        },
        // invalid data (invalid symbol)
        {
          free: '3',
          symbol: '',
          locked: '',
          frozen: ''
        }
      ]
      const result = getWalletBalances(balances)
      // ignore invalid data, that's 2 balances only
      expect(result.length).toEqual(2)

      // check BNB balance
      expect(result[0].asset).toEqual({
        chain: BNBChain,
        symbol: 'BNB',
        ticker: 'BNB',
        synth: false
      })
      expect(result[0].amount.amount()).toEqual(assetToBase(assetAmount(1)).amount())

      // Check RUNE balance
      expect(result[1].asset).toEqual({
        chain: BNBChain,
        symbol: 'RUNE-B1A',
        ticker: 'RUNE',
        synth: false
      })
      expect(result[1].amount.amount()).toEqual(assetToBase(assetAmount(2)).amount())
    })
  })
})
