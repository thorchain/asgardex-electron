import { baseAmount, bn } from '@xchainjs/xchain-util'

import { ZERO_BN } from '../const'
import { eqBaseAmount } from './fp/eq'
import { getAssetShare, getAssetSharePrice, getPoolShare, getRuneShare } from './poolShareHelper'

describe('poolShareHelpers', () => {
  it('getRuneShare', () => {
    const result = getRuneShare({ units: '3' }, { runeDepth: '12', units: '2' })
    const expected = baseAmount(18)
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getAssetShare', () => {
    const result = getAssetShare({ units: '3' }, { assetDepth: '12', units: '2' })
    const expected = baseAmount(18)
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getPoolShare', () => {
    expect(getPoolShare({ units: '0' }, { units: '6' })).toEqual(ZERO_BN)

    expect(getPoolShare({ units: '3' }, { units: '6' })).toEqual(bn(50))
  })

  it('getAssetSharePrice', () => {
    expect(getAssetSharePrice(bn(2), bn(3), bn(4)).amount()).toEqual(bn(24))
  })
})
