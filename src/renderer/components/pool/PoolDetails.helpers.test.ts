import { assetAmount, assetToBase, bn } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../const'
import { eqAssetAmount, eqBigNumber } from '../../helpers/fp/eq'
import {
  getLiquidity,
  getVolume,
  getAPY,
  getPrice,
  getTotalSwaps,
  getTotalTx,
  getMembers,
  getFees,
  getEarnings
} from './PoolDetails.helpers'

describe('PoolDetails.helpers', () => {
  describe('getLiquidity', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqAssetAmount.equals(getLiquidity({ runeDepth: '' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
      expect(eqAssetAmount.equals(getLiquidity({ runeDepth: 'asdasd' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })
    it('should get depth correctly for default price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getLiquidity({ runeDepth: assetToBase(assetAmount(100)).amount().toString() }),
          assetAmount(200)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getLiquidity({ runeDepth: assetToBase(assetAmount(123.123)).amount().toString() }),
          assetAmount(246.246)
        )
      ).toBeTruthy()
    })

    it('should get depth correctly for provided price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getLiquidity({ runeDepth: assetToBase(assetAmount(100)).amount().toString() }, bn(2)),
          assetAmount(400)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getLiquidity({ runeDepth: assetToBase(assetAmount(100)).amount().toString() }, bn(2.5)),
          assetAmount(500)
        )
      ).toBeTruthy()
    })
  })

  describe('getVolume', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqAssetAmount.equals(getVolume({ volume24h: '' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
      expect(eqAssetAmount.equals(getVolume({ volume24h: 'asdasd' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })
    it('should get volume correctly for default price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getVolume({ volume24h: assetToBase(assetAmount(123)).amount().toString() }),
          assetAmount(123)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getVolume({ volume24h: assetToBase(assetAmount(123.123123)).amount().toString() }),
          assetAmount(123.123123)
        )
      ).toBeTruthy()
    })

    it('should get volume correctly for provided price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getVolume({ volume24h: assetToBase(assetAmount(123)).amount().toString() }, bn(2)),
          assetAmount(246)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getVolume({ volume24h: assetToBase(assetAmount(100)).amount().toString() }, bn(2.5)),
          assetAmount(250)
        )
      ).toBeTruthy()
    })
  })

  describe('getAPY', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqBigNumber.equals(getAPY({ poolAPY: '' }), ZERO_BN)).toBeTruthy()
      expect(eqBigNumber.equals(getAPY({ poolAPY: 'asdasd' }), ZERO_BN)).toBeTruthy()
    })
    it('should get APY correctly', () => {
      expect(eqBigNumber.equals(getAPY({ poolAPY: '0.2120' }), bn(21.2))).toBeTruthy()
      expect(eqBigNumber.equals(getAPY({ poolAPY: '0.0123' }), bn(1.23))).toBeTruthy()
    })
  })

  describe('getPrice', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqAssetAmount.equals(getPrice({ assetPrice: '' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
      expect(eqAssetAmount.equals(getPrice({ assetPrice: 'asdasd' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })

    it('should get price correctly for default price ratio', () => {
      expect(eqAssetAmount.equals(getPrice({ assetPrice: '123' }), assetAmount(123))).toBeTruthy()

      expect(eqAssetAmount.equals(getPrice({ assetPrice: '123.123' }), assetAmount(123.123))).toBeTruthy()
    })

    it('should get price correctly for provided price ratio', () => {
      expect(eqAssetAmount.equals(getPrice({ assetPrice: '123' }, bn(2)), assetAmount(246))).toBeTruthy()

      expect(eqAssetAmount.equals(getPrice({ assetPrice: '100' }, bn(2.5)), assetAmount(250))).toBeTruthy()
    })
  })

  describe('getTotalSwaps', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqBigNumber.equals(getTotalSwaps({ swapCount: '' }), ZERO_BN)).toBeTruthy()
      expect(eqBigNumber.equals(getTotalSwaps({ swapCount: 'asdasd' }), ZERO_BN)).toBeTruthy()
    })
    it('should return total swaps amount correctly', () => {
      expect(eqBigNumber.equals(getTotalSwaps({ swapCount: '2120' }), bn(2120))).toBeTruthy()
      expect(eqBigNumber.equals(getTotalSwaps({ swapCount: '0123' }), bn(123))).toBeTruthy()
    })
  })

  describe('getTotalTx', () => {
    it('should return zero value for incorrect data', () => {
      expect(
        eqBigNumber.equals(
          getTotalTx({
            addLiquidityCount: 'asdfa',
            withdrawCount: 'saa',
            swapCount: 'asda'
          }),
          ZERO_BN
        )
      ).toBeTruthy()
      expect(
        eqBigNumber.equals(
          getTotalTx({
            addLiquidityCount: '',
            withdrawCount: '',
            swapCount: ''
          }),
          ZERO_BN
        )
      ).toBeTruthy()
    })

    it('should total swaps amount correctly', () => {
      expect(
        eqBigNumber.equals(
          getTotalTx({
            addLiquidityCount: '10',
            withdrawCount: '20',
            swapCount: '30'
          }),
          bn(60)
        )
      ).toBeTruthy()
      expect(
        eqBigNumber.equals(
          getTotalTx({
            addLiquidityCount: 'qwqwd',
            withdrawCount: 'safda',
            swapCount: '0123'
          }),
          bn(123)
        )
      ).toBeTruthy()
    })
  })

  describe('getMembers', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqBigNumber.equals(getMembers({ uniqueMemberCount: '' }), ZERO_BN)).toBeTruthy()
      expect(eqBigNumber.equals(getMembers({ uniqueMemberCount: 'asdasd' }), ZERO_BN)).toBeTruthy()
    })
    it('should return ьуьиукы amount correctly', () => {
      expect(eqBigNumber.equals(getMembers({ uniqueMemberCount: '2120' }), bn(2120))).toBeTruthy()
      expect(eqBigNumber.equals(getMembers({ uniqueMemberCount: '0123' }), bn(123))).toBeTruthy()
    })
  })

  describe('getFees', () => {
    it('should return zero value for incorrect data', () => {
      expect(eqAssetAmount.equals(getFees({ totalFees: '' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
      expect(eqAssetAmount.equals(getFees({ totalFees: 'asdasd' }), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })
    it('should get fees correctly for default price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getFees({ totalFees: assetToBase(assetAmount(123)).amount().toString() }),
          assetAmount(123)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getFees({ totalFees: assetToBase(assetAmount(123.123123)).amount().toString() }),
          assetAmount(123.123123)
        )
      ).toBeTruthy()
    })

    it('should get fees correctly for provided price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getFees({ totalFees: assetToBase(assetAmount(123)).amount().toString() }, bn(2)),
          assetAmount(246)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getFees({ totalFees: assetToBase(assetAmount(100)).amount().toString() }, bn(2.5)),
          assetAmount(250)
        )
      ).toBeTruthy()
    })
  })

  describe('getEarnings', () => {
    it('should return zero value for O.none', () => {
      expect(eqAssetAmount.equals(getEarnings(O.none), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })
    it('should return zero value for incorrect data', () => {
      expect(eqAssetAmount.equals(getEarnings(O.some({ earnings: '' })), ZERO_ASSET_AMOUNT)).toBeTruthy()
      expect(eqAssetAmount.equals(getEarnings(O.some({ earnings: 'asdasd' })), ZERO_ASSET_AMOUNT)).toBeTruthy()
    })
    it('should get earnings correctly for default price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getEarnings(O.some({ earnings: assetToBase(assetAmount(123)).amount().toString() })),
          assetAmount(123)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getEarnings(O.some({ earnings: assetToBase(assetAmount(123.123123)).amount().toString() })),
          assetAmount(123.123123)
        )
      ).toBeTruthy()
    })

    it('should get earnings correctly for provided price ratio', () => {
      expect(
        eqAssetAmount.equals(
          getEarnings(O.some({ earnings: assetToBase(assetAmount(123)).amount().toString() }), bn(2)),
          assetAmount(246)
        )
      ).toBeTruthy()

      expect(
        eqAssetAmount.equals(
          getEarnings(O.some({ earnings: assetToBase(assetAmount(100)).amount().toString() }), bn(2.5)),
          assetAmount(250)
        )
      ).toBeTruthy()
    })
  })
})
