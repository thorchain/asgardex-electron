import { baseAmount, assetFromString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { NonEmptyAssetsWithBalance } from '../services/wallet/types'
import { getAssetAmountByAsset, getBnbAmountFromBalances, getAssetWBByAsset } from './walletHelper'

describe('walletHelper', () => {
  const RUNE_WB = { amount: baseAmount('12300000000'), asset: ASSETS_TESTNET.RUNE }
  const BNB = O.fromNullable(assetFromString('BNB.BNB'))
  const BOLT_WB = { amount: baseAmount('23400000000'), asset: ASSETS_TESTNET.BOLT }
  const BNB_WB = { amount: baseAmount('45600000000'), asset: ASSETS_TESTNET.BNB }

  describe('amountByAsset', () => {
    it('returns amount of RUNE', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BOLT_WB, BNB_WB], ASSETS_TESTNET.RUNE)
      expect(
        FP.pipe(
          result,
          O.map((a) => a.amount().toNumber()),
          O.getOrElse(() => NaN)
        )
      ).toEqual(123)
    })
    it('returns None for an unknown asset', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BNB_WB], ASSETS_TESTNET.FTM)
      expect(result).toBeNone()
    })
    it('returns None for an empty list of assets', () => {
      const result = getAssetAmountByAsset([], ASSETS_TESTNET.FTM)
      expect(result).toBeNone()
    })
  })

  describe('getAssetWBByAsset', () => {
    it('returns amount of BNB', () => {
      const assetsWB: O.Option<NonEmptyAssetsWithBalance> = NEA.fromArray([RUNE_WB, BOLT_WB, BNB_WB])
      const result = O.toNullable(getAssetWBByAsset(assetsWB, BNB))
      expect(result?.asset.symbol).toEqual('BNB')
      expect(result?.amount.amount().toString()).toEqual('45600000000')
    })
    it('returns none if BNB is not available', () => {
      const assetsWB: O.Option<NonEmptyAssetsWithBalance> = NEA.fromArray([RUNE_WB, BOLT_WB])
      const result = getAssetWBByAsset(assetsWB, BNB)
      expect(result).toBeNone()
    })
    it('returns none for empty lists of `AssetWB`', () => {
      const assetsWB: O.Option<NonEmptyAssetsWithBalance> = NEA.fromArray([])
      const result = getAssetWBByAsset(assetsWB, BNB)
      expect(result).toBeNone()
    })
  })

  describe('getBnbAmountFromBalances', () => {
    it('returns amount of BNB', () => {
      const result = getBnbAmountFromBalances([RUNE_WB, BOLT_WB, BNB_WB])
      expect(
        FP.pipe(
          result,
          // Check transformation of `AssetAmount` to `BaseAmount`
          O.map((a) => a.amount().isEqualTo('456')),
          O.getOrElse(() => false)
        )
      ).toBeTruthy()
    })
    it('returns none if no BNB is available', () => {
      const result = getBnbAmountFromBalances([RUNE_WB, BOLT_WB])
      expect(result).toBeNone()
    })
  })
})
