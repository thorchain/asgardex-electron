import { withLatestFrom, tap, map } from 'rxjs/operators'

import { Locale } from '../../../shared/i18n/types'
import { locale$, initialLocale, changeLocale } from './service'

jest.mock('electron', () => ({ ipcRenderer: { send: jest.fn() } }))

describe('services/i18n/service/', () => {
  let langSpy: jest.SpyInstance
  let storageSpy: jest.SpyInstance

  describe('initialLocale', () => {
    beforeAll(() => {
      langSpy = jest.spyOn(global.navigator, 'language', 'get')
      storageSpy = jest.spyOn(localStorage.__proto__, 'getItem')
    })

    afterAll(() => {
      langSpy.mockRestore()
      storageSpy.mockRestore()
    })

    it('returns previous stored language', () => {
      storageSpy.mockImplementationOnce((_: string) => 'ru')
      expect(initialLocale()).toBe(Locale.RU)
    })

    it('returns lang of navigator if no lang has not been stored before', () => {
      storageSpy.mockImplementationOnce(() => null)
      langSpy.mockImplementationOnce(() => 'de-DE')
      expect(initialLocale()).toBe(Locale.DE)
    })

    it('returns EN by default if lang not found', () => {
      storageSpy.mockImplementationOnce(() => null)
      langSpy.mockImplementationOnce(() => 'unknown')
      expect(initialLocale()).toBe(Locale.EN)
    })
  })

  describe('locale$', () => {
    it('returns EN by default', () => {
      runObservable(({ expectObservable }) => {
        expectObservable(locale$).toBe('a', { a: Locale.EN })
      })
    })
  })

  describe('locale$', () => {
    it('calling changeLocale() four times changes network four times', () => {
      runObservable(({ cold, expectObservable }) => {
        const values = { a: Locale.EN, b: Locale.DE, c: Locale.RU }
        const change = '--a--b--c--b'
        const result = '--a--b--c--b'
        const result$ = cold(change, values).pipe(
          tap((locale: Locale) => changeLocale(locale)),
          withLatestFrom(locale$),
          map(([_, locale]) => locale)
        )
        expectObservable(result$).toBe(result, values)
      })
    })
  })
})
