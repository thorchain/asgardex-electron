import { ETHAddress } from '@xchainjs/xchain-ethereum'
import {
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRune67C,
  AssetRuneB1A,
  AssetRuneNative
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ERC20_TESTNET } from '../../shared/mock/assets'
import { AssetBUSDBAF, AssetBUSDBD1 } from '../const'
import {
  isBchAsset,
  isBnbAsset,
  isBtcAsset,
  isChainAsset,
  isEthTokenAsset,
  isEthAsset,
  isLtcAsset,
  isPricePoolAsset,
  isRuneBnbAsset,
  isRuneNativeAsset,
  getEthAssetAddress
} from './assetHelper'

describe('helpers/assetHelper', () => {
  describe('isRuneBnbAsset', () => {
    it('checks rune asset for testnet', () => {
      expect(isRuneBnbAsset(AssetRuneB1A)).toBeTruthy()
    })

    it('checks rune asset (mainnet)', () => {
      expect(isRuneBnbAsset(AssetRune67C)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneBnbAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isRuneNativeAsset', () => {
    it('checks rune asset for testnet', () => {
      expect(isRuneNativeAsset(AssetRuneNative)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneNativeAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isBnbAsset', () => {
    it('checks BNB asset', () => {
      expect(isBnbAsset(AssetBNB)).toBeTruthy()
    })

    it('returns false for any other asset than BNB', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })

  describe('isLtcAsset', () => {
    it('checks LTC asset', () => {
      expect(isLtcAsset(AssetLTC)).toBeTruthy()
    })

    it('returns false for any other asset than LTC', () => {
      expect(isLtcAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isBchAsset', () => {
    it('checks BCH asset', () => {
      expect(isBchAsset(AssetBCH)).toBeTruthy()
    })

    it('returns false for any other asset than BCH', () => {
      expect(isBchAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isBtcAsset', () => {
    it('checks BTC asset', () => {
      expect(isBtcAsset(AssetBTC)).toBeTruthy()
    })

    it('returns false for any other asset than BTC', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })

  describe('isEthAsset', () => {
    it('checks ETH asset', () => {
      expect(isEthAsset(AssetETH)).toBeTruthy()
    })

    it('returns false for any other asset than ETH', () => {
      expect(isBnbAsset(AssetRuneB1A)).toBeFalsy()
    })
  })

  describe('isEthTokenAsset', () => {
    it('is false for ETH', () => {
      expect(isEthTokenAsset(AssetETH)).toBeFalsy()
    })
    it('is true for ETH.USDT ', () => {
      expect(isEthTokenAsset(ERC20_TESTNET.USDT)).toBeTruthy()
    })
    it('is false for ETH.RUNE', () => {
      expect(isEthTokenAsset(ERC20_TESTNET.RUNE)).toBeTruthy()
    })
  })

  describe('getEthAssetAddress', () => {
    it('returns ETH address', () => {
      expect(getEthAssetAddress(AssetETH)).toEqual(O.some(ETHAddress))
    })
    it('returns ETH.USDT', () => {
      expect(getEthAssetAddress(ERC20_TESTNET.USDT)).toEqual(O.some('0xDB99328b43B86037f80B43c3DbD203F00F056B75'))
    })
    it('is returns None for non ETH assets', () => {
      expect(getEthAssetAddress(AssetRuneNative)).toBeNone()
    })
  })

  describe('isPricePoolAsset', () => {
    it('returns true for BUSDB', () => {
      expect(isPricePoolAsset(AssetBUSDBAF)).toBeTruthy()
      expect(isPricePoolAsset(AssetBUSDBD1)).toBeTruthy()
    })
    it('returns false for BNB', () => {
      expect(isPricePoolAsset(AssetBNB)).toBeFalsy()
    })
    it('returns false for deprecated asset ', () => {
      expect(isPricePoolAsset({ chain: 'BNB', symbol: 'RUNE-1AF', ticker: 'RUNE' })).toBeFalsy()
    })
  })

  describe('isChainAsset', () => {
    it('returns false for BNB', () => {
      expect(isChainAsset(AssetBNB)).toBeTruthy()
    })
    it('returns true for RUNE Native ', () => {
      expect(isChainAsset(AssetRuneNative)).toBeTruthy()
    })
    it('returns false for BUSDB', () => {
      expect(isChainAsset(AssetBUSDBAF)).toBeFalsy()
    })
  })
})
