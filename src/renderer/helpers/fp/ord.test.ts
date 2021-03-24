import { bn, baseAmount, AssetBTC, AssetRuneNative, AssetBNB } from '@xchainjs/xchain-util'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { WalletBalance } from '../../types/wallet'
import { ordBigNumber, ordBaseAmount, ordAsset, ordWalletBalanceByAsset } from './ord'

describe('helpers/fp/ord', () => {
  describe('ordBigNumber', () => {
    it('is greater', () => {
      expect(ordBigNumber.compare(bn(1.01), bn(1))).toEqual(1)
    })
    it('is less', () => {
      expect(ordBigNumber.compare(bn(1), bn(1.01))).toEqual(-1)
    })
  })
  describe('ordBaseAmount', () => {
    it('is greater', () => {
      expect(ordBaseAmount.compare(baseAmount(101), baseAmount(1))).toEqual(1)
    })
    it('is less', () => {
      expect(ordBaseAmount.compare(baseAmount(1), baseAmount(101))).toEqual(-1)
    })
    it('is equal', () => {
      expect(ordBaseAmount.compare(baseAmount(1), baseAmount(1))).toEqual(0)
    })
  })
  describe('ordAsset', () => {
    it('is less', () => {
      expect(ordAsset.compare(AssetRuneNative, AssetBTC)).toEqual(1)
    })
    it('is grreater', () => {
      expect(ordAsset.compare(AssetBTC, AssetRuneNative)).toEqual(-1)
    })
    it('is equal', () => {
      expect(ordAsset.compare(AssetBTC, AssetBTC)).toEqual(0)
    })
  })
  describe('ordWalletBalanceByAsset', () => {
    const a: WalletBalance = {
      amount: baseAmount('1'),
      asset: AssetRuneNative,
      walletAddress: ''
    }
    const b: WalletBalance = {
      ...a,
      asset: AssetBNB
    }
    const c: WalletBalance = {
      ...a,
      asset: ASSETS_TESTNET.BOLT
    }
    it('is less', () => {
      expect(ordWalletBalanceByAsset.compare(a, b)).toEqual(1)
    })
    it('is greater', () => {
      expect(ordWalletBalanceByAsset.compare(b, c)).toEqual(-1)
    })
    it('is equal', () => {
      expect(ordWalletBalanceByAsset.compare(a, a)).toEqual(0)
    })
  })
})
