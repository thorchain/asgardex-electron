import { assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { AssetRuneNative } from '../../../shared/utils/asset'
import { eqAssetsWithAmount, eqOAssetWithAmount } from '../../helpers/fp/eq'
import { Coin, Transaction } from '../../types/generated/midgard/models'
import { getRequestType, getTxType, mapCoin, mapTransaction } from './action.utils'

describe('poolActionsHistory.utils', () => {
  const invalidCoin: Coin = {
    asset: 'invalid asset',
    amount: 'invalid amount'
  }

  const validCoin: Coin = {
    asset: assetToString(AssetRuneNative),
    amount: '123'
  }

  const initialTxInfo: Transaction = {
    txID: 'txID',
    address: 'address',
    coins: []
  }

  describe('getTxType', () => {
    it('should return unknown for not specified strings', () => {
      expect(getTxType('asdasdfas')).toEqual('UNKNOWN')
      expect(getTxType('sss')).toEqual('UNKNOWN')
      expect(getTxType('unknown')).toEqual('UNKNOWN')
    })

    it('should return TxType for specified strings', () => {
      expect(getTxType('deposit')).toEqual('DEPOSIT')
      expect(getTxType('swap')).toEqual('SWAP')
      expect(getTxType('withdraw')).toEqual('WITHDRAW')
      expect(getTxType('donate')).toEqual('DONATE')
      expect(getTxType('refund')).toEqual('REFUND')
      expect(getTxType('addLiquidity')).toEqual('DEPOSIT')
    })
  })

  describe('getRequestType', () => {
    it('', () => {
      expect(getRequestType('DEPOSIT')).toEqual('addLiquidity')
      // expect(getRequestType('DOUBLE_SWAP')).toEqual('doubleSwap')
      expect(getRequestType('SWAP')).toEqual('swap')
      expect(getRequestType('WITHDRAW')).toEqual('withdraw')
      expect(getRequestType('REFUND')).toEqual('refund')
      expect(getRequestType('DONATE')).toEqual('donate')
      expect(getRequestType('ALL')).toBeUndefined()
      expect(getRequestType()).toBeUndefined()
    })
  })

  describe('mapCoin', () => {
    it('should return O.none in case if invalid coin', () => {
      expect(mapCoin(invalidCoin)).toBeNone()
      expect(mapCoin({ ...invalidCoin, amount: '1231' })).toBeNone()
    })
    it('should return O.some for valid coin value', () => {
      expect(
        eqOAssetWithAmount.equals(mapCoin(validCoin), O.some({ asset: AssetRuneNative, amount: baseAmount(123) }))
      ).toBeTruthy()
    })
  })

  describe('mapTransaction', () => {
    it('should map DTO correctly', () => {
      const res = mapTransaction({ ...initialTxInfo, coins: [invalidCoin, validCoin] })
      expect(eqAssetsWithAmount.equals(res.values, [{ asset: AssetRuneNative, amount: baseAmount(123) }])).toBeTruthy()
      expect(res.txID === initialTxInfo.txID && res.address === initialTxInfo.address).toBeTruthy()
    })
  })
})
