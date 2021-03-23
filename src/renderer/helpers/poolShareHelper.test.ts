import { assetAmount, assetToBase, bn } from '@xchainjs/xchain-util'

import { ZERO_BN } from '../const'
import { eqBaseAmount } from './fp/eq'
import { getAssetShare, getPoolShare, getRuneShare } from './poolShareHelper'

describe('poolShareHelpers', () => {
  it('getRuneShare', () => {
    const result = getRuneShare(bn('300000000'), { runeDepth: '12', units: '2' })
    const expected = assetToBase(assetAmount(18))
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getAssetShare', () => {
    const result = getAssetShare({
      liquidityUnits: bn('300000000'),
      detail: { assetDepth: '12', units: '2' },
      assetDecimal: 8
    })
    const expected = assetToBase(assetAmount(18))
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getPoolShare', () => {
    expect(getPoolShare(ZERO_BN, { units: '6' })).toEqual(ZERO_BN)

    expect(getPoolShare(bn('300000000'), { units: '6' })).toEqual(bn('5000000000'))
  })
})
