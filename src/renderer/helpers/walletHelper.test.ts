import { baseAmount, assetFromString, AssetRuneNative, AssetBNB, AssetLTC } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { NonEmptyWalletBalances, WalletBalance } from '../services/wallet/types'
import { isRuneNativeAsset } from './assetHelper'
import { eqWalletBalances } from './fp/eq'
import {
  filterWalletBalancesByAssets,
  getAssetAmountByAsset,
  getBnbAmountFromBalances,
  getLtcAmountFromBalances,
  getWalletBalanceByAsset,
  getWalletByAddress
} from './walletHelper'

describe('walletHelper', () => {
  const RUNE_WB: WalletBalance = {
    amount: baseAmount('12300000000'),
    asset: AssetRuneNative,
    walletAddress: 'rune native wallet address',
    walletType: 'keystore'
  }
  const BNB = O.fromNullable(assetFromString('BNB.BNB'))
  const BOLT_WB: WalletBalance = {
    amount: baseAmount('23400000000'),
    asset: ASSETS_TESTNET.BOLT,
    walletAddress: 'bolt wallet address',
    walletType: 'keystore'
  }
  const BNB_WB: WalletBalance = {
    amount: baseAmount('45600000000'),
    asset: AssetBNB,
    walletAddress: 'bnb wallet address',
    walletType: 'keystore'
  }

  const LTC_WB: WalletBalance = {
    amount: baseAmount('45300000000'),
    asset: AssetLTC,
    walletAddress: 'ltc wallet address',
    walletType: 'keystore'
  }

  describe('amountByAsset', () => {
    it('returns amount of RUNE', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BOLT_WB, BNB_WB], AssetRuneNative)
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

  describe('getWalletBalanceByAsset', () => {
    it('returns amount of BNB', () => {
      const balances: O.Option<NonEmptyWalletBalances> = NEA.fromArray([RUNE_WB, BOLT_WB, BNB_WB])
      const result = O.toNullable(getWalletBalanceByAsset(balances, BNB))
      expect(result?.asset.symbol).toEqual('BNB')
      expect(result?.amount.amount().toString()).toEqual('45600000000')
    })
    it('returns none if BNB is not available', () => {
      const balances: O.Option<NonEmptyWalletBalances> = NEA.fromArray([RUNE_WB, BOLT_WB])
      const result = getWalletBalanceByAsset(balances, BNB)
      expect(result).toBeNone()
    })
    it('returns none for empty lists of `AssetWB`', () => {
      const balances: O.Option<NonEmptyWalletBalances> = NEA.fromArray([])
      const result = getWalletBalanceByAsset(balances, BNB)
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

  describe('getLtcAmountFromBalances', () => {
    it('returns amount of LTC', () => {
      const result = getLtcAmountFromBalances([RUNE_WB, BOLT_WB, BNB_WB, LTC_WB])
      expect(
        FP.pipe(
          result,
          // Check transformation of `AssetAmount` to `BaseAmount`
          O.map((a) => a.amount().isEqualTo('453')),
          O.getOrElse(() => false)
        )
      ).toBeTruthy()
    })
    it('returns none if no LTC is available', () => {
      const result = getLtcAmountFromBalances([RUNE_WB, BOLT_WB])
      expect(result).toBeNone()
    })
  })

  describe('filterWalletBalancesByAssets', () => {
    it('returns filted wallet balances by assets', () => {
      const result = filterWalletBalancesByAssets([RUNE_WB, BOLT_WB, BNB_WB, LTC_WB], [AssetBNB, AssetLTC])
      expect(eqWalletBalances.equals(result, [BNB_WB, LTC_WB])).toBeTruthy()
    })
    it('returns empty array if no asset is available', () => {
      const result = filterWalletBalancesByAssets([RUNE_WB, BOLT_WB], [AssetLTC])
      expect(eqWalletBalances.equals(result, [])).toBeTruthy()
    })
  })

  describe('getWalletByAddress', () => {
    it('returns address of RUNE wallet', () => {
      const balances: NonEmptyWalletBalances = NEA.fromReadonlyNonEmptyArray([RUNE_WB, BOLT_WB, BNB_WB])
      const result = O.toNullable(getWalletByAddress(balances, RUNE_WB.walletAddress))
      expect(isRuneNativeAsset(result?.asset ?? AssetBNB /* BNB would fail */)).toBeTruthy()
      expect(result?.walletAddress).toEqual(RUNE_WB.walletAddress)
    })
    it('returns none if BNB wallet address is not available', () => {
      const balances: NonEmptyWalletBalances = NEA.fromReadonlyNonEmptyArray([BOLT_WB, BNB_WB])
      const result = getWalletByAddress(balances, RUNE_WB.walletAddress)
      expect(result).toBeNone()
    })
  })
})
