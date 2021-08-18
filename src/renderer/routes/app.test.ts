import { base, settings } from './app'

describe('App routes', () => {
  describe('base', () => {
    it('template', () => {
      expect(base.template).toEqual('/')
    })
    it('path', () => {
      expect(base.path()).toEqual('/')
    })
  })

  describe('settings', () => {
    it('template', () => {
      expect(settings.template).toEqual('/settings')
    })
    it('path', () => {
      expect(settings.path()).toEqual('/settings')
    })
  })
})
