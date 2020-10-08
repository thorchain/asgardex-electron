import { bn } from '@thorchain/asgardex-util'

import { ZERO_BN } from '../../../const'
import { getRuneShare, getAssetShare, getAssetSharePrice, getPoolShare } from './ShareView.helper'

describe('ShareView/helper', () => {
  it('getRuneShare', () => {
    expect(getRuneShare({ units: '3' }, { runeDepth: '12', poolUnits: '2' })).toEqual(bn(18))
  })

  it('getAssetShare', () => {
    expect(getAssetShare({ units: '3' }, { assetDepth: '12', poolUnits: '2' })).toEqual(bn(18))
  })

  it('getAssetSharePrice', () => {
    expect(getAssetSharePrice(bn(2), bn(3), bn(4)).amount()).toEqual(bn(24))
  })

  it('getPoolShare', () => {
    expect(getPoolShare({ units: '3' }, {})).toEqual(ZERO_BN)

    expect(getPoolShare({ units: '3' }, { poolUnits: '6' })).toEqual(bn(50))
  })
})
