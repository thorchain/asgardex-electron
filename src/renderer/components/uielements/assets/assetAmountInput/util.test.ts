import { formatValue, validValue } from './util'

describe('components/AssetAmountInput/util', () => {
  describe('formatValue', () => {
    it('formats string numbers with thousend and decimal separator', () => {
      expect(formatValue('1234567.89')).toEqual('1,234,567.89')
    })
    it('formats empty string to 0', () => {
      expect(formatValue('')).toEqual('0')
    })
    it('formats "." to 0.', () => {
      expect(formatValue('.')).toEqual('0.')
    })
    it('formats non numbers to 0', () => {
      expect(formatValue('9llo0')).toEqual('90')
    })
    it('formats non numbers to 0', () => {
      expect(formatValue('hello')).toEqual('0')
    })
    it('trims zeros', () => {
      expect(formatValue('00001.01000')).toEqual('1.01')
    })
  })

  describe('validValue', () => {
    it('returns true for strings of numbers ', () => {
      expect(validValue('123')).toBeTruthy()
    })
    it('returns true for strings of decimal numbers ', () => {
      expect(validValue('123.45')).toBeTruthy()
    })
    it('returns true "0."', () => {
      expect(validValue('0.')).toBeTruthy()
    })
    it('returns false for non numbers ', () => {
      expect(validValue('hello')).toBeFalsy()
    })

    it('returns false for numbers including invalid characters ', () => {
      expect(validValue('9hello')).toBeFalsy()
    })
  })
})
