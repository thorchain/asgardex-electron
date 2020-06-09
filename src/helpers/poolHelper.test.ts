import { PoolDetails } from '../services/midgard/types'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { filterPendingPools, getDeepestPool } from './poolHelper'

describe('helpers/poolHelper/', () => {
  const pool1: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped, runeDepth: '1000' }
  const pool2: PoolDetail = { status: PoolDetailStatusEnum.Enabled, runeDepth: '2000' }
  const pool3: PoolDetail = { status: PoolDetailStatusEnum.Disabled, runeDepth: '0' }
  const pool4: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped, runeDepth: '4000' }

  describe('filterPendingPools', () => {
    const pool4: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped }

    it('filters pending pools', () => {
      const pools = [pool1, pool2, pool3, pool4]
      const result = filterPendingPools(pools).length
      expect(result).toEqual(2)
    })

    it('does not filter any pending pools', () => {
      const pools = [pool2, pool3]
      const result = filterPendingPools(pools).length
      expect(result).toEqual(0)
    })
  })

  describe('hasPendingPools', () => {
    it('has pending pools', () => {
      const pools = [pool1, pool2, pool3, pool4]
      const result = filterPendingPools(pools).length
      expect(result).toBeTruthy()
    })

    it('has not pending pools', () => {
      const pools = [pool2, pool3]
      const result = filterPendingPools(pools).length
      expect(result).toBeFalsy()
    })
  })

  describe('getDeepestPool', () => {
    it('returns deepest pool', () => {
      const pools = [pool1, pool2, pool4, pool3]
      const result = getDeepestPool(pools)
      expect(result).toEqual(pool4)
    })

    it('does not return a deepest pool by given an empty list of pools', () => {
      const pools: PoolDetails = []
      const result = getDeepestPool(pools)
      expect(result).toBeNothing()
    })
  })
})
