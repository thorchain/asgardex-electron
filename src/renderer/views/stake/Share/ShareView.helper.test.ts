import { bn } from '@thorchain/asgardex-util'

import { ZERO_BN } from '../../../const'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'
import { getRuneShare, getAssetShare, getAssetSharePrice, getPoolShare } from './ShareView.helper'

describe('ShareView/helper', () => {
  it('getRuneShare', () => {
    expect(
      getRuneShare({ stakeUnits: '3' } as StakersAssetData, { runeDepth: '12', poolUnits: '2' } as PoolDetail)
    ).toEqual(bn(18))
  })

  it('getAssetShare', () => {
    expect(
      getAssetShare({ stakeUnits: '3' } as StakersAssetData, { assetDepth: '12', poolUnits: '2' } as PoolDetail)
    ).toEqual(bn(18))
  })

  it('getAssetSharePrice', () => {
    expect(getAssetSharePrice(bn(2), bn(3), bn(4)).amount()).toEqual(bn(24))
  })

  it('getPoolShare', () => {
    expect(getPoolShare({ stakeUnits: '3' } as StakersAssetData, {} as PoolDetail)).toEqual(ZERO_BN)

    expect(getPoolShare({ stakeUnits: '3' } as StakersAssetData, { poolUnits: '6' } as PoolDetail)).toEqual(bn(50))
  })
})
