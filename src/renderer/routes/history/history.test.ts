import { base } from './history'

describe('History routes', () => {
  describe('base routes', () => {
    it('template', () => {
      expect(base.template).toEqual('/history')
    })
    it('path', () => {
      expect(base.path()).toEqual('/history')
    })
  })
})
