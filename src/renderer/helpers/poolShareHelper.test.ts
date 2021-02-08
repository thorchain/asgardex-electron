import { assetAmount, assetToBase, bn } from '@xchainjs/xchain-util'

import { THREE_RUNE_BASE_AMOUNT } from '../../shared/mock/amount'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../const'
import { eqBaseAmount } from './fp/eq'
import { getAssetShare, getPoolShare, getRuneShare } from './poolShareHelper'

describe('poolShareHelpers', () => {
  it('getRuneShare', () => {
    const result = getRuneShare(THREE_RUNE_BASE_AMOUNT, { runeDepth: '12', units: '2' })
    const expected = assetToBase(assetAmount(18))
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getAssetShare', () => {
    const result = getAssetShare(THREE_RUNE_BASE_AMOUNT, { assetDepth: '12', units: '2' })
    const expected = assetToBase(assetAmount(18))
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getPoolShare', () => {
    expect(getPoolShare(ZERO_BASE_AMOUNT, { units: '6' })).toEqual(ZERO_BN)

    expect(getPoolShare(THREE_RUNE_BASE_AMOUNT, { units: '6' })).toEqual(bn('5000000000'))
  })
})
