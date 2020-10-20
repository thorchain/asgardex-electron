import { baseAmount, bn } from '@thorchain/asgardex-util'

import { ZERO_BN } from '../../../const'
import { eqBaseAmount } from '../../../helpers/fp/eq'
import { getRuneShare, getAssetShare, getAssetSharePrice, getPoolShare } from './ShareView.helper'

describe('ShareView/helper', () => {
  it('getRuneShare', () => {
    const result = getRuneShare({ units: '3' }, { runeDepth: '12', poolUnits: '2' })
    const expected = baseAmount(18)
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getAssetShare', () => {
    const result = getAssetShare({ units: '3' }, { assetDepth: '12', poolUnits: '2' })
    const expected = baseAmount(18)
    expect(eqBaseAmount.equals(result, expected)).toBeTruthy()
  })

  it('getAssetSharePrice', () => {
    expect(getAssetSharePrice(bn(2), bn(3), bn(4)).amount()).toEqual(bn(24))
  })

  it('getPoolShare', () => {
    expect(getPoolShare({ units: '3' }, {})).toEqual(ZERO_BN)

    expect(getPoolShare({ units: '3' }, { poolUnits: '6' })).toEqual(bn(50))
  })
})
