import { getMimirStatus } from './useMimirHalt'

describe('hooks/useMimirHalt', () => {
  describe.only('getMimirStatus', () => {
    it('mimir = 1', () => {
      expect(getMimirStatus(1)).toBeTruthy()
    })
    it('mimir = 0', () => {
      expect(getMimirStatus(0)).toBeFalsy()
    })
    it('mimir = 99, blockheight = 100', () => {
      expect(getMimirStatus(99, 100)).toBeTruthy()
    })
    it('mimir = 100, blockheight = 100', () => {
      expect(getMimirStatus(100, 100)).toBeFalsy()
    })
    it('mimir = 101, blockheight = 100', () => {
      expect(getMimirStatus(101, 100)).toBeFalsy()
    })
    it('mimir = 10, blockheight = 0', () => {
      expect(getMimirStatus(10, 0)).toBeFalsy()
    })
    it('mimir = undefined + blockheight = undefined', () => {
      expect(getMimirStatus(undefined, undefined)).toBeFalsy()
    })
  })
})
