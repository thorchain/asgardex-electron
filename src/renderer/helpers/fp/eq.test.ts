import { Balance } from '@xchainjs/xchain-client'
import { baseAmount, bn, Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { ApiError, ErrorId } from '../../services/wallet/types'
import {
  eqAsset,
  eqBaseAmount,
  eqBalance,
  eqBalances,
  eqApiError,
  egBigNumber,
  eqOAsset,
  eqChain,
  eqOChain
} from './eq'

describe('helpers/fp/eq', () => {
  describe('egBigNumber', () => {
    it('is equal', () => {
      expect(egBigNumber.equals(bn(1.01), bn(1.01))).toBeTruthy()
    })
    it('is not equal', () => {
      expect(egBigNumber.equals(bn(1), bn(1.01))).toBeFalsy()
    })
  })

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

  describe('eqOAsset', () => {
    it('same some(asset) are equal', () => {
      const a = O.some(ASSETS_TESTNET.RUNE)
      expect(eqOAsset.equals(a, a)).toBeTruthy()
    })
    it('different some(asset) are not equal', () => {
      const a = O.some(ASSETS_TESTNET.RUNE)
      const b = O.some(ASSETS_TESTNET.BNB)
      expect(eqOAsset.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b = O.some(ASSETS_TESTNET.BNB)
      expect(eqOAsset.equals(O.none, b)).toBeFalsy()
    })
    it('none/none are equal', () => {
      expect(eqOAsset.equals(O.none, O.none)).toBeTruthy()
    })
  })

  describe('eqChain', () => {
    it('is equal', () => {
      expect(eqChain.equals('THOR', 'THOR')).toBeTruthy()
    })
    it('is not equal', () => {
      expect(eqChain.equals('THOR', 'BNB')).toBeFalsy()
    })
  })

  describe('eqOChain', () => {
    it('same some(chain) are equal', () => {
      const a: O.Option<Chain> = O.some('THOR')
      expect(eqOChain.equals(a, a)).toBeTruthy()
    })
    it('different some(chain) are not equal', () => {
      const a: O.Option<Chain> = O.some('THOR')
      const b: O.Option<Chain> = O.some('BNB')
      expect(eqOChain.equals(a, b)).toBeFalsy()
    })
    it('none/some are not equal', () => {
      const b: O.Option<Chain> = O.some('BNB')
      expect(eqOChain.equals(O.none, b)).toBeFalsy()
    })
    it('none/none are equal', () => {
      expect(eqOChain.equals(O.none, O.none)).toBeTruthy()
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
      errorId: ErrorId.GET_BALANCES,
      msg: 'msg'
    }
    it('is equal', () => {
      expect(eqApiError.equals(a, a)).toBeTruthy()
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
        errorId: ErrorId.SEND_TX
      }
      expect(eqApiError.equals(a, b)).toBeFalsy()
    })
  })

  describe('eqBalance', () => {
    it('is equal', () => {
      const a: Balance = {
        amount: baseAmount('1'),
        asset: ASSETS_TESTNET.BNB
      }
      expect(eqBalance.equals(a, a)).toBeTruthy()
    })
    it('is not equal', () => {
      const a: Balance = {
        amount: baseAmount('1'),
        asset: ASSETS_TESTNET.BNB
      }
      // b = same as a, but another amount
      const b: Balance = {
        ...a,
        amount: baseAmount('2')
      }
      // c = same as a, but another asset
      const c: Balance = {
        ...a,
        asset: ASSETS_TESTNET.RUNE
      }
      expect(eqBalance.equals(a, b)).toBeFalsy()
      expect(eqBalance.equals(a, c)).toBeFalsy()
    })
  })

  describe('eqAssetsWithBalance', () => {
    const a: Balance = {
      amount: baseAmount('1'),
      asset: ASSETS_TESTNET.RUNE
    }
    const b: Balance = {
      ...a,
      asset: ASSETS_TESTNET.BNB
    }
    const c: Balance = {
      ...a,
      asset: ASSETS_TESTNET.BOLT
    }
    it('is equal', () => {
      expect(eqBalances.equals([a, b], [a, b])).toBeTruthy()
    })
    it('is not equal wit different elements', () => {
      expect(eqBalances.equals([a, b], [b, c])).toBeFalsy()
    })
    it('is not equal if elements has been flipped', () => {
      expect(eqBalances.equals([a, b], [b, a])).toBeFalsy()
    })
  })
})
