import { ThemeType } from '@thorchain/asgardex-theme'
import { Subscription } from 'rxjs'

import { initialContext } from './ThemeContext'

const { themeType$, toggleTheme } = initialContext
describe('ThemeContext', () => {
  let sub: Subscription
  afterEach(() => {
    sub?.unsubscribe()
  })
  describe('ThemeContextValue', () => {
    beforeEach(() => {})
    describe('themeType$', () => {
      it('returns light theme as default', (done) => {
        sub = themeType$.subscribe((type: ThemeType) => {
          expect(type).toBe(ThemeType.LIGHT)
          done()
        })
      })
    })
    describe('toggleTheme$', () => {
      it('toggles light to dark theme', (done) => {
        const result: ThemeType[] = []
        const expected: ThemeType[] = [ThemeType.LIGHT, ThemeType.DARK]
        sub = themeType$.subscribe((type: ThemeType) => {
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
