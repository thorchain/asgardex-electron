import { ThemeType } from '@thorchain/asgardex-theme'

import { initialContext } from './ThemeContext'

const { themeType$, toggleTheme } = initialContext
describe('ThemeContext', () => {
  describe('ThemeContextValue', () => {
    beforeEach(() => {})
    describe('themeType$', () => {
      it('returns light theme as default', (done) => {
        themeType$.subscribe((type: ThemeType) => {
          expect(type).toBe(ThemeType.LIGHT)
          done()
        })
      })
    })
    describe('toggleTheme$', () => {
      it('toggles light to dark theme', (done) => {
        const result: ThemeType[] = []
        const expected: ThemeType[] = [ThemeType.LIGHT, ThemeType.DARK]
        themeType$.subscribe((type: ThemeType) => {
          result.push(type)
          if (result.length >= 2) {
            expect(result).toStrictEqual(expected)
            done()
          }
        })
        toggleTheme()
      })
    })
  })
})
