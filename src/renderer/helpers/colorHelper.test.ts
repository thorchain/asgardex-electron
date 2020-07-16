import { getIntFromName, rgb2hex, rainbowStop } from './colorHelpers'

describe('colorHelper', () => {
  describe('rgb2hex', () => {
    it('hex of white', () => {
      expect(rgb2hex(255, 255, 255)).toEqual('#ffffff')
    })

    it('hex of black', () => {
      const result = rgb2hex(0, 0, 0)
      expect(result).toEqual('#000000')
    })

    it('hex of gold', () => {
      const result = rgb2hex(255, 215, 0)
      expect(result).toEqual('#ffd700')
    })
  })

  describe('getIntFromName', () => {
    it('returns a valid value for RUNE (uppercase)', () => {
      const result = getIntFromName('RUNE')
      expect(result).toEqual([0.77, 0.91])
    })
    it('returns a valid value for rune (lowercase)', () => {
      const result = getIntFromName('rune')
      expect(result).toEqual([0.77, 0.91])
    })
  })

  describe('rainbowStop', () => {
    it('hex of white', () => {
      const result = rainbowStop(10)
      expect(result).toEqual('#ff0000')
    })
    it('hex of something green like color', () => {
      const result = rainbowStop(0.3)
      expect(result).toEqual('#33ff00')
    })
    it('hex of something pink like color', () => {
      const result = rainbowStop(0.86)
      expect(result).toEqual('#ff00d6')
    })
  })
})
