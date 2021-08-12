import { ETHAddress } from '@xchainjs/xchain-ethereum'
import {
  assetAmount,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRune67C,
  AssetRuneB1A,
  AssetRuneERC20,
  AssetRuneNative,
  baseAmount,
  BNBChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ERC20_TESTNET } from '../../shared/mock/assets'
import {
  AssetBUSDBAF,
  AssetBUSDBD1,
  AssetUniH,
  AssetUniHAddress,
  AssetUSDTERC20,
  AssetXRune,
  AssetXRuneTestnet
} from '../const'
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
  getEthAssetAddress,
  midgardAssetFromString,
  updateEthChecksumAddress,
  convertBaseAmountDecimal,
  isUSDAsset,
  max1e8BaseAmount,
  to1e8BaseAmount,
  getTwoSigfigAssetAmount,
  isXRuneAsset,
  disableRuneUpgrade,
  assetInERC20Blacklist,
  addressInERC20Blacklist,
  assetInBinanceBlacklist
} from './assetHelper'
import { eqAsset, eqAssetAmount, eqBaseAmount } from './fp/eq'

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
    it('checks rune native asset', () => {
      expect(isRuneNativeAsset(AssetRuneNative)).toBeTruthy()
    })

    it('returns false for any other asset than RUNE', () => {
      expect(isRuneNativeAsset(AssetBNB)).toBeFalsy()
    })
  })

  describe('isXRuneAsset', () => {
    it('checks XRUNE asset (mainnet)', () => {
      expect(isXRuneAsset(AssetXRune)).toBeTruthy()
    })
    it('checks XRUNE asset (testnet)', () => {
      expect(isXRuneAsset(AssetXRuneTestnet)).toBeTruthy()
    })

    it('returns false for any other asset than XRUNE', () => {
      expect(isXRuneAsset(AssetBNB)).toBeFalsy()
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

  describe('assetInERC20Blacklist', () => {
    it('ETH (non black listed)', () => {
      expect(assetInERC20Blacklist(AssetETH)).toBeFalsy()
    })
    it('UNIH (black listed)', () => {
      expect(assetInERC20Blacklist(AssetUniH)).toBeTruthy()
    })

    it('USDT (non black listed)', () => {
      expect(addressInERC20Blacklist('0xdb99328b43b86037f80b43c3dbd203f00f056b75')).toBeFalsy()
    })
    it('UNIH (black listed)', () => {
      expect(addressInERC20Blacklist(AssetUniHAddress)).toBeTruthy()
    })
  })

  describe('assetInBinanceBlacklist', () => {
    it('RUNE-67C is black listed on mainnet', () => {
      expect(assetInBinanceBlacklist('mainnet', AssetRune67C)).toBeTruthy()
    })
    it('RUNE-B1A is not black listed on mainnet', () => {
      expect(assetInBinanceBlacklist('mainnet', AssetRuneB1A)).toBeFalsy()
    })
    it('RUNE-67C is not black listed on testnet', () => {
      expect(assetInBinanceBlacklist('testnet', AssetRune67C)).toBeFalsy()
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
      expect(isPricePoolAsset({ chain: BNBChain, symbol: 'RUNE-1AF', ticker: 'RUNE' })).toBeFalsy()
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

  describe('isUSDAsset', () => {
    it('returns true for BUSD', () => {
      expect(isUSDAsset(AssetBUSDBAF)).toBeTruthy()
    })
    it('returns true for ERC20 USDT', () => {
      expect(isUSDAsset(AssetUSDTERC20)).toBeTruthy()
    })
    it('returns false for RUNE Native', () => {
      expect(isUSDAsset(AssetRuneNative)).toBeFalsy()
    })
  })

  describe('midgardAssetFromString', () => {
    it('returns AssetETH for ETH asset string', () => {
      const asset = midgardAssetFromString('ETH.ETH')
      expect(asset).toEqual(O.some(AssetETH))
    })
    it('returns AssetUSDTERC20 for ERC20 USDT asset string ', () => {
      const asset = midgardAssetFromString('ETH.USDT-0x62e273709da575835c7f6aef4a31140ca5b1d190')
      expect(asset).toEqual(O.some({ ...AssetUSDTERC20, symbol: 'USDT-0x62e273709Da575835C7f6aEf4A31140Ca5b1D190' }))
    })
    it('returns O.none for invalid asset strings', () => {
      const asset = midgardAssetFromString('invalid')
      expect(asset).toEqual(O.none)
    })
  })

  describe('updateEthChecksumAddress', () => {
    it('does not update AssetETH ', () => {
      const asset = updateEthChecksumAddress(AssetETH)
      expect(eqAsset.equals(asset, AssetETH)).toBeTruthy()
    })
    it('updates invalid ERC20 USDT ', () => {
      const asset = updateEthChecksumAddress({
        ...AssetUSDTERC20,
        symbol: 'USDT-0xA3910454BF2CB59B8B3A401589A3BACC5CA42306'
      })
      expect(eqAsset.equals(asset, AssetUSDTERC20)).toBeTruthy()
    })
  })

  describe('convertBaseAmountDecimal', () => {
    it('converts 1e8 decimal to 1e12', () => {
      const result = convertBaseAmountDecimal(baseAmount('12345678', 8), 12)
      expect(eqBaseAmount.equals(result, baseAmount('123456780000', 12))).toBeTruthy()
    })
    it('converts 1e8 decimal to 1e18 (part 1)', () => {
      const result = convertBaseAmountDecimal(baseAmount('739', 8), 18)
      expect(eqBaseAmount.equals(result, baseAmount('7390000000000', 18))).toBeTruthy()
    })
    it('converts 1e8 decimal to 1e18 (part 2)', () => {
      const result = convertBaseAmountDecimal(baseAmount('7481127', 8), 18)
      expect(eqBaseAmount.equals(result, baseAmount('74811270000000000', 18))).toBeTruthy()
    })
    it('converts 1e8 decimal to 1e6 ', () => {
      const result = convertBaseAmountDecimal(baseAmount('12345678', 8), 6)
      expect(eqBaseAmount.equals(result, baseAmount('123456', 6))).toBeTruthy()
    })
    it('converts 1e18 decimal to 1e8', () => {
      const result = convertBaseAmountDecimal(baseAmount('123456789012345678', 18), 8)
      expect(eqBaseAmount.equals(result, baseAmount('12345678', 8))).toBeTruthy()
    })
    it('does not convert anything by using same decimals', () => {
      const amount = baseAmount('123456', 6)
      const result = convertBaseAmountDecimal(amount, 6)
      expect(eqBaseAmount.equals(result, amount)).toBeTruthy()
    })
  })

  describe('max1e8BaseAmount', () => {
    it('converts 1e12 to 1e8', () => {
      const result = max1e8BaseAmount(baseAmount('123456789012', 12))
      expect(eqBaseAmount.equals(result, baseAmount('12345678', 8))).toBeTruthy()
    })
    it('keeps 1e6 unchanged', () => {
      const result = max1e8BaseAmount(baseAmount('123456', 6))
      expect(eqBaseAmount.equals(result, baseAmount('123456', 6))).toBeTruthy()
    })
  })

  describe('to1e8BaseAmount', () => {
    it('converts 1e12 to 1e8', () => {
      const result = to1e8BaseAmount(baseAmount('123456789012', 12))
      expect(eqBaseAmount.equals(result, baseAmount('12345678', 8))).toBeTruthy()
    })
    it('converts 1e6 to 1e8', () => {
      const result = to1e8BaseAmount(baseAmount('123456', 6))
      expect(eqBaseAmount.equals(result, baseAmount('12345600', 8))).toBeTruthy()
    })
    it('keeps 1e8 unchanged', () => {
      const result = to1e8BaseAmount(baseAmount('12345678', 8))
      expect(eqBaseAmount.equals(result, baseAmount('12345678', 8))).toBeTruthy()
    })
  })

  describe('getTwoSigfigAssetAmount', () => {
    it('returns two decimal amount in case the value is bigger than 1', () => {
      const result = getTwoSigfigAssetAmount(assetAmount('12.234'))
      expect(eqAssetAmount.equals(result, assetAmount('12.23'))).toBeTruthy()
    })
    it('returns two sigfig amount in case the value is less than 1', () => {
      const result = getTwoSigfigAssetAmount(assetAmount('0.0123'))
      expect(eqAssetAmount.equals(result, assetAmount('0.012'))).toBeTruthy()
    })
  })

  describe('disableRuneUpgrade', () => {
    it('disabled for BNB.RUNE + halted THORChain', () => {
      expect(disableRuneUpgrade({ asset: AssetRune67C, haltThorChain: true, haltEthChain: false })).toBeTruthy()
    })
    it('enabled for BNB.RUNE + halted ETH chain', () => {
      expect(disableRuneUpgrade({ asset: AssetRune67C, haltThorChain: false, haltEthChain: true })).toBeFalsy()
    })
    it('enabled for BNB.RUNE + no halted chains', () => {
      expect(disableRuneUpgrade({ asset: AssetRune67C, haltThorChain: false, haltEthChain: false })).toBeFalsy()
    })
    it('disabled for ETH.RUNE + halted ETH chain', () => {
      expect(disableRuneUpgrade({ asset: AssetRuneERC20, haltThorChain: false, haltEthChain: true })).toBeTruthy()
    })
    it('disabled for ETH.RUNE + halted THORChain', () => {
      expect(disableRuneUpgrade({ asset: AssetRuneERC20, haltThorChain: true, haltEthChain: false })).toBeTruthy()
    })
    it('enable for ETH.RUNE + no halted chains', () => {
      expect(disableRuneUpgrade({ asset: AssetRuneERC20, haltThorChain: false, haltEthChain: false })).toBeFalsy()
    })
  })
})
