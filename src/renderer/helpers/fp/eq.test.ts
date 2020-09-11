import { baseAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { AssetWithBalance, ApiError, ErrorId } from '../../services/wallet/types'
import { eqAsset, eqBaseAmount, eqAssetWithBalance, eqAssetsWithBalance, eqApiError } from './eq'

describe('helpers/fp/eq', () => {
  describe('eqAsset', () => {
    it('is equal', () => {
      const a = ASSETS_TESTNET.RUNE
      expect(eqAsset.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a = ASSETS_TESTNET.RUNE
      const b = ASSETS_TESTNET.BNB
      expect(eqAsset.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqBaseAmount', () => {
    it('is equal', () => {
      const a = baseAmount(100, 18)
      expect(eqBaseAmount.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a = baseAmount(100, 18)
      const b = baseAmount(222, 18)
      expect(eqBaseAmount.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqApiError', () => {
    const a: ApiError = {
      apiId: 'BNB',
      errorId: ErrorId.GET_BALANCES,
      msg: 'msg'
    }
    it('is equal', () => {
      expect(eqApiError.equals(a, a)).toBeTruthy()
    })
    it('is not equal with different apiId', () => {
      const b: ApiError = {
        ...a,
        apiId: 'BTC'
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
    it('is not equal with different msg', () => {
      const b: ApiError = {
        ...a,
        msg: 'anotherMsg'
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
    it('is not equal with different msg', () => {
      const b: ApiError = {
        ...a,
        errorId: ErrorId.GET_ADDRESS
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqAssetWithBalance', () => {
    it('is equal', () => {
      const a: AssetWithBalance = {
        amount: baseAmount('1'),
        frozenAmount: O.none,
        asset: ASSETS_TESTNET.BNB
      }
      expect(eqAssetWithBalance.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: AssetWithBalance = {
        amount: baseAmount('1'),
        frozenAmount: O.none,
        asset: ASSETS_TESTNET.BNB
      }
      // b = same as a, but another amount
      const b: AssetWithBalance = {
        ...a,
        amount: baseAmount('2')
      }
      // c = same as a, but another frozenAmount
      const c: AssetWithBalance = {
        ...a,
        frozenAmount: O.some(baseAmount('1'))
      }
      // d = same as a, but another frozenAmount
      const d: AssetWithBalance = {
        ...a,
        asset: ASSETS_TESTNET.RUNE
      }
      expect(eqAssetWithBalance.equals(a, b)).toBeFalsy()
      expect(eqAssetWithBalance.equals(a, c)).toBeFalsy()
      expect(eqAssetWithBalance.equals(a, d)).toBeFalsy()
    })
  })

  describe('eqAssetsWithBalance', () => {
    const a: AssetWithBalance = {
      amount: baseAmount('1'),
      frozenAmount: O.none,
      asset: ASSETS_TESTNET.RUNE
    }
    const b: AssetWithBalance = {
      ...a,
      asset: ASSETS_TESTNET.BNB
    }
    const c: AssetWithBalance = {
      ...a,
      asset: ASSETS_TESTNET.BOLT
    }
    it('is equal', () => {
      expect(eqAssetsWithBalance.equals([a, b], [a, b])).toBeTruthy()
    })
    it('is not equal wit different elements', () => {
      expect(eqAssetsWithBalance.equals([a, b], [b, c])).toBeFalsy()
    })
    it('is not equal if elements has been flipped', () => {
      expect(eqAssetsWithBalance.equals([a, b], [b, a])).toBeFalsy()
    })
  })
})
