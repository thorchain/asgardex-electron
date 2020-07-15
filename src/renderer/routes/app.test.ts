import { base } from './app'

describe('App routes', () => {
  describe('base', () => {
    it('template', () => {
      expect(base.template).toEqual('/')
    })
    it('path', () => {
      expect(base.path()).toEqual('/')
    })
  })
})
