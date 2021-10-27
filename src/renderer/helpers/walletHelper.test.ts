import { assetToBase, AssetRuneNative, AssetBNB, AssetLTC, assetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { NonEmptyWalletBalances, WalletBalance, WalletBalances } from '../services/wallet/types'
import { isRuneNativeAsset } from './assetHelper'
import { eqWalletBalances } from './fp/eq'
import { mockWalletBalance } from './test/testWalletHelper'
import {
  filterWalletBalancesByAssets,
  getAssetAmountByAsset,
  getBnbAmountFromBalances,
  getLtcAmountFromBalances,
  getWalletBalanceByAsset,
  getWalletByAddress
} from './walletHelper'

describe('walletHelper', () => {
  const RUNE_WB = mockWalletBalance({ amount: assetToBase(assetAmount(1)), walletAddress: 'thor-address' })
  const RUNE_LEDGER_WB = mockWalletBalance({
    amount: assetToBase(assetAmount(2)),
    walletAddress: 'thor-ledger-address',
    walletType: 'ledger'
  })
  const BOLT_WB = mockWalletBalance({
    amount: assetToBase(assetAmount(3)),
    walletAddress: 'bolt-address',
    asset: ASSETS_TESTNET.BOLT
  })
  const BNB_WB: WalletBalance = mockWalletBalance({
    amount: assetToBase(assetAmount(4)),
    walletAddress: 'bnb-address',
    asset: AssetBNB
  })
  const LTC_WB = mockWalletBalance({
    amount: assetToBase(assetAmount(5)),
    asset: AssetLTC
  })

  describe('amountByAsset', () => {
    it('returns amount of RUNE', () => {
      const result = getAssetAmountByAsset([RUNE_WB, BOLT_WB, BNB_WB], AssetRuneNative)
      expect(
        FP.pipe(
          result,
          O.map((a) => a.amount().toString()),
          O.getOrElse(() => '')
        )
      ).toEqual('1')
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
      const result = O.toNullable(getWalletBalanceByAsset(balances, AssetBNB))
      expect(result?.asset.symbol).toEqual('BNB')
      expect(result?.amount.amount().toString()).toEqual('400000000')
    })
    it('returns none if BNB is not available', () => {
      const balances: O.Option<NonEmptyWalletBalances> = NEA.fromArray([RUNE_WB, BOLT_WB])
      const result = getWalletBalanceByAsset(balances, AssetBNB)
      expect(result).toBeNone()
    })
    it('returns none for empty lists of `AssetWB`', () => {
      const balances: O.Option<NonEmptyWalletBalances> = NEA.fromArray([])
      const result = getWalletBalanceByAsset(balances, AssetBNB)
      expect(result).toBeNone()
    })
  })

  describe('getBnbAmountFromBalances', () => {
    it('returns amount of BNB', () => {
      const result = getBnbAmountFromBalances([RUNE_WB, BOLT_WB, BNB_WB])
      expect(
        FP.pipe(
          result,
          // Check transformation from `BaseAmount` to `AssetAmount`
          O.map((a) => a.amount().isEqualTo(4)),
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
          // Check transformation from `BaseAmount` to `AssetAmount`
          O.map((a) => a.amount().isEqualTo('5')),
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
    it('filters misc. assets', () => {
      const result = filterWalletBalancesByAssets(
        [RUNE_WB, RUNE_LEDGER_WB, BOLT_WB, BNB_WB, LTC_WB],
        [AssetBNB, AssetLTC]
      )
      expect(eqWalletBalances.equals(result, [BNB_WB, LTC_WB])).toBeTruthy()
    })

    it('filters rune keystore + ledger', () => {
      const result = filterWalletBalancesByAssets([RUNE_WB, RUNE_LEDGER_WB, BOLT_WB, BNB_WB, LTC_WB], [AssetRuneNative])
      expect(eqWalletBalances.equals(result, [RUNE_WB, RUNE_LEDGER_WB])).toBeTruthy()
    })
    it('returns empty array if no asset is available', () => {
      const result = filterWalletBalancesByAssets([RUNE_WB, BOLT_WB], [AssetLTC])
      expect(eqWalletBalances.equals(result, [])).toBeTruthy()
    })
  })

  describe('getWalletByAddress', () => {
    it('returns address of RUNE wallet', () => {
      const balances: WalletBalances = NEA.fromReadonlyNonEmptyArray([RUNE_WB, BOLT_WB, BNB_WB])
      const result = O.toNullable(getWalletByAddress(balances, RUNE_WB.walletAddress))
      expect(isRuneNativeAsset(result?.asset ?? AssetBNB /* BNB would fail */)).toBeTruthy()
      expect(result?.walletAddress).toEqual(RUNE_WB.walletAddress)
    })
    it('returns none if BNB wallet address is not available', () => {
      const balances: WalletBalances = NEA.fromReadonlyNonEmptyArray([BOLT_WB, BNB_WB])
      const result = getWalletByAddress(balances, RUNE_WB.walletAddress)
      expect(result).toBeNone()
    })
  })
})
