import { formatValue, validInputValue } from './Input.util'

describe('components/BigNumberInput/util', () => {
  describe('formatValue', () => {
    it('formats string numbers with thousend and decimal separator', () => {
      expect(formatValue('1234567.89', 8)).toEqual('1,234,567.89')
    })
    it('formats string numbers by given decimal', () => {
      expect(formatValue('1.2345678', 2)).toEqual('1.23')
    })
    it('formats empty string to "0"', () => {
      expect(formatValue('')).toEqual('0')
    })
    it('formats "." to 0.', () => {
      expect(formatValue('.')).toEqual('0.')
    })
    it('formats "." to "0" for non (zero) decimal values', () => {
      expect(formatValue('.', 0)).toEqual('0')
    })
    it('formats zeros to "0"', () => {
      expect(formatValue('0000')).toEqual('0')
    })
    it('formats decimal zeros to "0"', () => {
      expect(formatValue('0.000')).toEqual('0')
    })
    it('ignores non numbers in string', () => {
      expect(formatValue('a9ü&9%"+Ä')).toEqual('99')
    })
    it('formats string of non numbers to 0', () => {
      expect(formatValue('hello')).toEqual('0')
    })
    it('trims zeros', () => {
      expect(formatValue('00001.01000')).toEqual('1.01')
    })
  })

  describe('validInputValue', () => {
    it('returns true for strings of numbers ', () => {
      expect(validInputValue('123')).toBeTruthy()
    })
    it('returns true for strings of decimal numbers ', () => {
      expect(validInputValue('123.45')).toBeTruthy()
    })
    it('returns true for "0."', () => {
      expect(validInputValue('0.')).toBeTruthy()
    })
    it('returns false for non numbers ', () => {
      expect(validInputValue('hello')).toBeFalsy()
    })

    it('returns false for numbers including invalid characters ', () => {
      expect(validInputValue('9hello')).toBeFalsy()
    })
  })
})
